'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const {test,run}=require('./harness');
const {resolvePacks,installPacks}=require('../lib/pack-registry');
test('dependency closure is ordered, unique and rejects unknown/traversal names',()=>{
 assert.deepStrictEqual(resolvePacks('SUPABASE'),['postgres','supabase']);
 for(const p of ['postgres','scientific','ai-research']) assert.deepStrictEqual(resolvePacks(p),[p]);
 assert.deepStrictEqual(resolvePacks(null),[]);
 for(const p of ['../postgres','unknown','__proto__']) assert.throws(()=>resolvePacks(p));
});
test('pack validation happens before pruning and all other packs are removed',()=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'ace-packs-'));
 const make=p=>{const dir=path.join(d,'.ace/packs',p);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'.aceconfig-ext'),'triggers: {}');};
 try {
  make('supabase');make('scientific');
  assert.throws(()=>installPacks(d,'supabase'),/Missing.*postgres/);
  assert.ok(fs.existsSync(path.join(d,'.ace/packs/scientific')));
  make('postgres');
  assert.deepStrictEqual(installPacks(d,'supabase'),['postgres','supabase']);
  assert.deepStrictEqual(fs.readdirSync(path.join(d,'.ace/packs')).sort(),['postgres','supabase']);
  installPacks(d,null);assert.ok(!fs.existsSync(path.join(d,'.ace/packs')));
 } finally {fs.rmSync(d,{recursive:true,force:true});}
});
module.exports=run;
