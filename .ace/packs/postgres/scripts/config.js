'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const PLATFORM = ['auth','storage','realtime','extensions','vault','supabase_functions','graphql_public','supabase_migrations'];

function safePath(root, relative) {
  if (typeof relative !== 'string' || !relative.startsWith('docs/database/') || relative.includes('\\') || relative.split('/').some(x => !x || x === '.' || x === '..')) {
    throw new Error('Output must be a relative descendant of docs/database/');
  }
  const resolved = path.resolve(root, relative);
  let walk = root;
  for (const part of relative.split('/')) {
    walk = path.join(walk, part);
    if (fs.existsSync(walk) && fs.lstatSync(walk).isSymbolicLink()) throw new Error('Output paths cannot contain symlinks');
  }
  return resolved;
}
function schemas(value, label, nonempty=false) {
  if (!Array.isArray(value) || (nonempty && !value.length) || value.some(s => typeof s !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) || new Set(value).size !== value.length) {
    throw new Error(`${label} must be an explicit ${nonempty ? 'nonempty ' : ''}array of unique simple SQL identifiers`);
  }
  return [...value].sort();
}
function connectionEnv(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Connection environment variable must contain a PostgreSQL URL'); }
  if (!['postgres:','postgresql:'].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) throw new Error('Invalid PostgreSQL connection URL');
  const env = {...process.env};
  // Do not inherit libpq routing overrides from an unrelated session.
  for (const key of Object.keys(env)) if (key.startsWith('PG')) delete env[key];
  Object.assign(env, {PGHOST:url.hostname.replace(/^\[|\]$/g,''), PGPORT:url.port || '5432', PGUSER:decodeURIComponent(url.username), PGPASSWORD:decodeURIComponent(url.password), PGDATABASE:decodeURIComponent(url.pathname.slice(1)), PGCONNECT_TIMEOUT:'10', PGOPTIONS:'-c default_transaction_read_only=on -c statement_timeout=30000'});
  for (const [key,v] of url.searchParams) {
    if (!['sslmode','sslrootcert','sslcert','sslkey'].includes(key)) throw new Error('Unsupported connection URL option');
    env['PG'+key.toUpperCase()] = v;
  }
  return env;
}
function load(configPath, {supabase=false, root=process.cwd(), env=process.env}={}) {
  let config;
  try { config = JSON.parse(fs.readFileSync(configPath || env.ACE_DB_DOCS_CONFIG || 'docs/database/config.json','utf8')); }
  catch { throw new Error('Provide a readable JSON config via ACE_DB_DOCS_CONFIG or the config argument'); }
  if (!config || Array.isArray(config) || typeof config !== 'object') throw new Error('Config must be an object');
  const readArray = (key, variable, required) => {
    let value = config[key];
    if (env[variable] !== undefined) { try { value=JSON.parse(env[variable]); } catch { throw new Error(`${variable} must be a JSON array`); } }
    return schemas(value, key, required);
  };
  const owned = readArray('owned_schemas','ACE_DB_OWNED_SCHEMAS',true);
  const exposed = readArray('exposed_schemas','ACE_DB_EXPOSED_SCHEMAS',false);
  const excluded = schemas(config.excluded_schemas || [], 'excluded_schemas');
  const exclusions = [...new Set([...excluded, ...(supabase ? PLATFORM : [])])];
  if (owned.some(s => exclusions.includes(s) || s.startsWith('pg_') || s === 'information_schema')) throw new Error('Owned scope overlaps excluded/platform schemas');
  if (!/^[A-Z_][A-Z0-9_]*$/.test(config.connection_env || '')) throw new Error('connection_env must name an environment variable');
  const connection = env[config.connection_env];
  if (!connection) throw new Error('Required connection environment variable is not set');
  const pgEnv = connectionEnv(connection);
  if (supabase) assertSafeTarget(config.target, pgEnv, root);
  const output = safePath(root,config.output || 'docs/database/reference');
  const typesOutput = safePath(root,config.types_output || 'docs/database/database.types.ts');
  if (typesOutput === output || typesOutput.startsWith(output + path.sep) || output.startsWith(typesOutput + path.sep)) throw new Error('Reference and type output paths must not overlap');
  return {root:path.resolve(root), owned, exposed:exposed.filter(s => !exclusions.includes(s)), excluded:exclusions, output, typesOutput, pgEnv, connection, config};
}
function assertSafeTarget(target, env, root) {
  const host = env.PGHOST;
  if (target && target.kind === 'local' && ['localhost','127.0.0.1','::1'].includes(host)) return;
  if (target && target.kind === 'preview' && typeof target.attestation_file === 'string') {
    let a;
    try { a=JSON.parse(fs.readFileSync(path.resolve(root,target.attestation_file),'utf8')); } catch { throw new Error('Preview target needs an explicit readable approval attestation'); }
    if (a.kind === 'preview' && a.host === host && a.database === env.PGDATABASE && a.approved_by && a.evidence_ref && Number.isFinite(Date.parse(a.expires)) && Date.parse(a.expires) > Date.now()) return;
  }
  throw new Error('Supabase agents require a local stack or an explicitly attested preview target; production is forbidden');
}
function run(command, args, options={}) {
  const r=spawnSync(command,args,{encoding:'utf8',maxBuffer:32*1024*1024,...options});
  if (r.error && r.error.code === 'ENOENT') throw new Error(`Required tool missing: ${command}; install it before running this gate`);
  // Tool output can contain DSNs and SQL values. Never forward it automatically.
  if (r.error || r.status !== 0) throw new Error(`${command} failed; check tool installation, configuration and local service availability`);
  return r.stdout;
}
module.exports={load, safePath, schemas, connectionEnv, assertSafeTarget, run, PLATFORM};
