'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const {test,run}=require('./harness');
const {generate}=require('../../.ace/packs/postgres/scripts/reference');
test('generator failure preserves existing reference and never exposes tool output',()=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'ace-generator-'));
 try {
  const output=path.join(d,'reference');fs.mkdirSync(output);fs.writeFileSync(path.join(output,'keep'),'old');
  fs.writeFileSync(path.join(d,'psql'),`#!/bin/sh\ncase "$(cat)" in *'FROM findings'*) echo '[]';; *) echo '[{"kind":"schema","identity":"schema","description":"description"}]';; esac\n`,{mode:0o755});
  fs.writeFileSync(path.join(d,'tbls'), '#!/bin/sh\necho sensitive-tool-output >&2\nexit 7\n',{mode:0o755});
  const c={owned:['a'],exposed:[],excluded:[],output,connection:'runtime-value',pgEnv:{...process.env,PATH:d+':'+process.env.PATH}};
  assert.throws(()=>generate(c),e=>e.message.includes('tbls failed')&&!e.message.includes('sensitive-tool-output'));
  assert.strictEqual(fs.readFileSync(path.join(output,'keep'),'utf8'),'old');
 } finally {fs.rmSync(d,{recursive:true,force:true});}
});
module.exports=run;
