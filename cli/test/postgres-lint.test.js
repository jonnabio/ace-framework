'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const {test,run}=require('./harness');
const {lint}=require('../../.ace/packs/postgres/scripts/catalog');
test('catalog wrapper propagates findings, malformed output and tool failure without secrets',()=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'ace-psql-'));
 const c={owned:['a'],exposed:[],pgEnv:{...process.env,PATH:d}};
 try {
  for(const [body,ok,pattern] of [
   ["echo '[]'",true],
   ["echo '[{\"code\":\"comment\",\"identity\":\"table\"}]'",false,/comment/],
   ["echo 'invalid'",false,/invalid catalog/],
   ["echo 'sensitive-output' >&2; exit 2",false,/psql failed/]]) {
    fs.writeFileSync(path.join(d,'psql'),'#!/bin/sh\n'+body+'\n',{mode:0o755});
    if(ok) assert.doesNotThrow(()=>lint(c)); else assert.throws(()=>lint(c),pattern);
  }
  fs.unlinkSync(path.join(d,'psql'));assert.throws(()=>lint(c),/Required tool missing: psql/);
 } finally {fs.rmSync(d,{recursive:true,force:true});}
});
module.exports=run;
