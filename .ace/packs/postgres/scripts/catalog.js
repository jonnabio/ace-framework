'use strict';
const fs=require('fs'),path=require('path');
const {run}=require('./config');
function query(config, file) {
  const sql=fs.readFileSync(path.join(__dirname,'../sql/catalog.sql'),'utf8') + fs.readFileSync(path.join(__dirname,'../sql',file),'utf8');
  const text=run('psql',['-X','-qAt','-v','ON_ERROR_STOP=1','-v',`owned_schemas=${JSON.stringify(config.owned)}`,'-v',`exposed_schemas=${JSON.stringify(config.exposed)}`],{input:sql,env:config.pgEnv});
  let rows;
  try { rows=JSON.parse(text); } catch { throw new Error('psql returned an invalid catalog response'); }
  if (!Array.isArray(rows)) throw new Error('psql returned an invalid catalog response');
  return rows;
}
function lint(config) {
  const findings=query(config,'doc-lint.sql');
  if (findings.length) throw new Error(`Catalog documentation findings: ${findings.map(f=>`${f.code}: ${f.identity}`).join('; ')}`);
}
module.exports={query,lint};
if(require.main===module) {
  try { if(process.argv.length>3) throw new Error('Usage: doc-lint.sh [config.json]'); lint(require('./config').load(process.argv[2])); console.log('Catalog documentation complete.'); }
  catch(e) {console.error(e.message);process.exit(1);}
}
