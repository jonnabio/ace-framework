'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const {test,run}=require('./harness');
const {generateTypes,writeTypes}=require('../../.ace/packs/supabase/scripts/types');
test('types invoke only local CLI, preserve existing output on failure and reject preview',()=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'ace-types-')),previous=process.env.PATH;
 try {
  const file=path.join(d,'supabase');
  // Construct a synthetic endpoint at runtime; no connection examples are shipped.
  const endpoint=new URL('http://localhost');endpoint.protocol='http:';
  const status=JSON.stringify({DB_URL:endpoint.origin+'/fixture'});
  fs.writeFileSync(file,`#!/bin/sh\nif [ "$1" = status ]; then printf '%s' '${status}'; else printf '%s' "$*" > '${d}/args'; echo 'export type Database = {}'; fi\n`,{mode:0o755});
  process.env.PATH=d+':'+previous;
  const c={root:d,typesOutput:path.join(d,'types'),config:{target:{kind:'local'}},owned:['a'],pgEnv:{PGHOST:'localhost',PGPORT:'5432',PGDATABASE:'fixture'}};
  const result=generateTypes(c);assert.ok(result.startsWith('// Generated'));
  assert.strictEqual(fs.readFileSync(path.join(d,'args'),'utf8'),'gen types --local --lang typescript --schema a');
  fs.writeFileSync(c.typesOutput,'keep');fs.writeFileSync(file,'#!/bin/sh\nexit 9\n',{mode:0o755});
  assert.throws(()=>writeTypes(c));assert.strictEqual(fs.readFileSync(c.typesOutput,'utf8'),'keep');
  c.config.target.kind='preview';assert.throws(()=>generateTypes(c),/local-only/);
 } finally {process.env.PATH=previous;fs.rmSync(d,{recursive:true,force:true});}
});
module.exports=run;
