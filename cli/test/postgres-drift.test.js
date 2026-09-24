'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const {spawnSync}=require('child_process');
const {test,run}=require('./harness');
const {assertClean}=require('../../.ace/packs/postgres/scripts/drift');
test('Git baseline detects staged, unstaged, untracked, ignored and deleted artifacts',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ace-drift-')),output=path.join(root,'docs/database/reference');
 const c={root,output};
 const git=(...args)=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.strictEqual(r.status,0,r.stderr);};
 try {
  fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'README.md'),'reference');
  assert.throws(()=>assertClean(c));
  git('init','-q');assert.throws(()=>assertClean(c));
  git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@invalid','commit','-qm','baseline');
  assert.doesNotThrow(()=>assertClean(c));
  fs.writeFileSync(path.join(output,'README.md'),'changed');assert.throws(()=>assertClean(c),/changes/);
  git('add','.');assert.throws(()=>assertClean(c),/changes/);
  git('reset','--hard','HEAD');fs.unlinkSync(path.join(output,'README.md'));assert.throws(()=>assertClean(c),/changes/);
  git('reset','--hard','HEAD');fs.writeFileSync(path.join(output,'new.md'),'new');assert.throws(()=>assertClean(c),/changes/);fs.unlinkSync(path.join(output,'new.md'));
  fs.writeFileSync(path.join(root,'.git/info/exclude'),'*.ignored\n');fs.writeFileSync(path.join(output,'new.ignored'),'ignored');assert.throws(()=>assertClean(c),/changes/);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
module.exports=run;
