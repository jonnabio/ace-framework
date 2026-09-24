'use strict';
const assert=require('assert'), fs=require('fs'),os=require('os'),path=require('path');
const {test,run}=require('./harness');
const config=require('../../.ace/packs/postgres/scripts/config');
test('configuration rejects empty, duplicate and unsafe owned scope before connecting',()=>{
  for(const v of [[],['x','x'],['x;select'],['x.*']]) assert.throws(()=>config.schemas(v,'owned',true));
  assert.deepStrictEqual(config.schemas(['z','a'],'owned',true),['a','z']);
});
test('output paths cannot escape or pass through symlinks',()=>{
  const d=fs.mkdtempSync(path.join(os.tmpdir(),'ace-path-'));
  try {
    for(const p of ['docs/database/../x','/tmp/x','docs/database/','docs/database']) assert.throws(()=>config.safePath(d,p));
    fs.mkdirSync(path.join(d,'docs'));fs.symlinkSync(os.tmpdir(),path.join(d,'docs/database'));
    assert.throws(()=>config.safePath(d,'docs/database/reference'));
  } finally {fs.rmSync(d,{recursive:true,force:true});}
});
test('missing config and missing external tools fail clearly',()=>{
  assert.throws(()=>config.load('/nonexistent'),/readable JSON/);
  assert.throws(()=>config.run('ace-nonexistent-executable',[]),/Required tool missing/);
});
test('Supabase safety refuses unproven preview and production targets',()=>{
  assert.doesNotThrow(()=>config.assertSafeTarget({kind:'local'},{PGHOST:'127.0.0.1'},'.'));
  assert.throws(()=>config.assertSafeTarget({kind:'preview'},{PGHOST:'remote'},'.'),/explicitly attested/);
  assert.throws(()=>config.assertSafeTarget({kind:'production'},{PGHOST:'remote'},'.'),/production is forbidden/);
});
module.exports=run;
