'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../..');
const { connectionEnv } = require(path.join(ROOT, '.ace/packs/postgres/scripts/config'));
const { lint } = require(path.join(ROOT, '.ace/packs/postgres/scripts/catalog'));
const { generate } = require(path.join(ROOT, '.ace/packs/postgres/scripts/reference'));
const { check } = require(path.join(ROOT, '.ace/packs/postgres/scripts/drift'));
const { generateTypes } = require(path.join(ROOT, '.ace/packs/supabase/scripts/types'));

function fail(message) {
  console.error(`database-docs integration: ${message}`);
  process.exit(1);
}

function command(name, args, options = {}) {
  const result = spawnSync(name, args, { encoding: 'utf8', ...options });
  if (result.error || result.status !== 0) {
    fail(`${name} is required and must succeed (${result.error ? result.error.message : result.stderr})`);
  }
  return result.stdout.trim();
}

const dbUrl = process.env.ACE_DB_INTEGRATION_URL;
const supabaseWorkdir = process.env.ACE_SUPABASE_WORKDIR;
if (!dbUrl) fail('set ACE_DB_INTEGRATION_URL to a disposable local PostgreSQL database');
if (!supabaseWorkdir || !fs.existsSync(path.join(supabaseWorkdir, 'supabase/config.toml'))) {
  fail('set ACE_SUPABASE_WORKDIR to a running disposable local Supabase project');
}

const versions = {
  node: process.version,
  psql: command('psql', ['--version']),
  tbls: command('tbls', ['version']),
  supabase: command('supabase', ['--version']),
};

const suffix = `ace_docs_${process.pid}_${Date.now()}`.replace(/[^a-z0-9_]/g, '');
const schema = suffix;
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-db-integration-'));
const output = path.join(tempRoot, 'docs/database/reference');
const pgEnv = { ...connectionEnv(dbUrl), PATH: process.env.PATH };
const fixtureEnv = { ...pgEnv };
delete fixtureEnv.PGOPTIONS;
const config = {
  root: tempRoot,
  owned: [schema],
  exposed: [schema],
  excluded: [],
  output,
  typesOutput: path.join(tempRoot, 'docs/database/database.types.ts'),
  connection: dbUrl,
  pgEnv,
  config: { target: { kind: 'local' } },
};

function sql(text) {
  const result = spawnSync('psql', ['-X', '-q', '-v', 'ON_ERROR_STOP=1'], {
    input: text, env: fixtureEnv, encoding: 'utf8',
  });
  if (result.error || result.status !== 0) fail(`fixture SQL failed: ${result.stderr}`);
}

function quote(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

const q = quote(schema);
try {
  sql(`
    CREATE SCHEMA ${q};
    COMMENT ON SCHEMA ${q} IS 'Integration fixture namespace';
    CREATE TYPE ${q}.state AS ENUM ('open', 'closed');
    CREATE DOMAIN ${q}.code AS text CHECK (VALUE <> '');
    CREATE TYPE ${q}.coordinates AS (x integer, y integer);
    CREATE SEQUENCE ${q}.ticket_number;
    CREATE TABLE ${q}.tickets (
      id bigint PRIMARY KEY,
      code ${q}.code NOT NULL,
      state ${q}.state NOT NULL,
      title text NOT NULL,
      CONSTRAINT title_nonempty CHECK (title <> '')
    );
    CREATE INDEX tickets_title_idx ON ${q}.tickets (title);
    CREATE VIEW ${q}.ticket_view AS SELECT id, title FROM ${q}.tickets;
    CREATE MATERIALIZED VIEW ${q}.ticket_count AS SELECT count(*) AS total FROM ${q}.tickets;
    CREATE FUNCTION ${q}.touch_ticket() RETURNS trigger LANGUAGE plpgsql AS
      'BEGIN NEW.title := NEW.title; RETURN NEW; END';
    CREATE TRIGGER ticket_touch BEFORE UPDATE ON ${q}.tickets
      FOR EACH ROW EXECUTE FUNCTION ${q}.touch_ticket();
    CREATE FUNCTION ${q}.privileged_ticket() RETURNS bigint
      LANGUAGE sql SECURITY DEFINER AS 'SELECT 1::bigint';
    CREATE PROCEDURE ${q}.maintain_tickets() LANGUAGE plpgsql AS 'BEGIN NULL; END';
    CREATE POLICY ticket_read ON ${q}.tickets FOR SELECT USING (true);
  `);

  let findings;
  try { lint(config); fail('an incomplete catalog unexpectedly passed'); }
  catch (error) { findings = error.message; }
  for (const code of ['comment:', 'classification:', 'rls:', 'search_path:']) {
    if (!findings.includes(code)) fail(`expected ${code} finding, got ${findings}`);
  }

  sql(`
    ALTER TABLE ${q}.tickets ENABLE ROW LEVEL SECURITY;
    COMMENT ON TYPE ${q}.state IS 'Ticket workflow state';
    COMMENT ON DOMAIN ${q}.code IS 'Nonempty ticket code';
    COMMENT ON CONSTRAINT code_check ON DOMAIN ${q}.code IS 'Requires a nonempty code';
    COMMENT ON TYPE ${q}.coordinates IS 'Example composite coordinate';
    COMMENT ON SEQUENCE ${q}.ticket_number IS 'Allocates ticket numbers';
    COMMENT ON TABLE ${q}.tickets IS 'Stores synthetic integration tickets';
    COMMENT ON COLUMN ${q}.tickets.id IS 'Ticket identifier; classification: internal; pii: none';
    COMMENT ON COLUMN ${q}.tickets.code IS 'Business code; classification: internal; pii: none';
    COMMENT ON COLUMN ${q}.tickets.state IS 'Workflow state; classification: internal; pii: none';
    COMMENT ON COLUMN ${q}.tickets.title IS 'Synthetic title; classification: confidential; pii: personal';
    COMMENT ON CONSTRAINT tickets_pkey ON ${q}.tickets IS 'Primary ticket identity';
    COMMENT ON CONSTRAINT title_nonempty ON ${q}.tickets IS 'Requires a nonempty title';
    COMMENT ON INDEX ${q}.tickets_title_idx IS 'Supports title lookup';
    COMMENT ON VIEW ${q}.ticket_view IS 'Ticket projection';
    COMMENT ON COLUMN ${q}.ticket_view.id IS 'Ticket identifier; classification: internal; pii: none';
    COMMENT ON COLUMN ${q}.ticket_view.title IS 'Synthetic title; classification: confidential; pii: personal';
    COMMENT ON MATERIALIZED VIEW ${q}.ticket_count IS 'Ticket count summary';
    COMMENT ON COLUMN ${q}.ticket_count.total IS 'Synthetic count; classification: internal; pii: none';
    COMMENT ON FUNCTION ${q}.touch_ticket() IS 'Normalizes changed tickets';
    COMMENT ON FUNCTION ${q}.privileged_ticket() IS 'Returns a fixed synthetic identifier';
    ALTER FUNCTION ${q}.privileged_ticket() SET search_path = '';
    COMMENT ON PROCEDURE ${q}.maintain_tickets() IS 'Performs synthetic maintenance';
    COMMENT ON POLICY ticket_read ON ${q}.tickets IS 'Allows fixture reads';
    COMMENT ON TRIGGER ticket_touch ON ${q}.tickets IS 'Normalizes fixture updates';
  `);
  lint(config);

  generate(config);
  const first = new Map();
  for (const file of fs.readdirSync(output)) {
    const full = path.join(output, file);
    if (fs.statSync(full).isFile()) first.set(file, fs.readFileSync(full));
  }
  generate(config);
  for (const [file, bytes] of first) {
    if (!bytes.equals(fs.readFileSync(path.join(output, file)))) fail(`unstable generation: ${file}`);
  }
  const allOutput = [...first.values()].map(value => value.toString()).join('\n');
  if (allOutput.includes(dbUrl)) fail('generated reference leaked its connection value');
  for (const kind of ['policy', 'function', 'procedure', 'trigger', 'type']) {
    if (!allOutput.includes(`"kind": "${kind}"`)) fail(`generated supplement omitted ${kind}`);
  }

  command('git', ['init', '-q'], { cwd: tempRoot });
  command('git', ['add', '.'], { cwd: tempRoot });
  command('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@invalid',
    'commit', '-qm', 'generated baseline'], { cwd: tempRoot });
  check(config);

  const localTypesConfig = {
    ...config,
    root: supabaseWorkdir,
    owned: [schema],
    pgEnv,
    config: { target: { kind: 'local' } },
  };
  const typesBefore = generateTypes(localTypesConfig);
  if (!typesBefore.includes(schema)) fail('local generated types omitted fixture schema');
  sql(`ALTER TABLE ${q}.tickets ADD COLUMN integration_marker boolean;
    COMMENT ON COLUMN ${q}.tickets.integration_marker IS
      'Synthetic marker; classification: internal; pii: none';`);
  const typesAfter = generateTypes(localTypesConfig);
  if (typesBefore === typesAfter || !typesAfter.includes('integration_marker')) {
    fail('local type generation did not expose schema drift');
  }

  console.log(JSON.stringify({ result: 'pass', schema, versions }, null, 2));
} finally {
  sql(`DROP SCHEMA IF EXISTS ${q} CASCADE;`);
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
