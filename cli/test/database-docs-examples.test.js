'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const {test,run}=require('./harness');
const {validateTasksFile}=require('../lib/validate-tasks');
test('database task example validates and references executable shipped checks',()=>{
 const root=path.join(__dirname,'../..'),file=path.join(root,'docs/progress/tasks.database-docs.example.json');
 assert.deepStrictEqual(validateTasksFile(file),[]);
 const q=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const t of q.tasks) assert.ok(fs.existsSync(path.join(root,t.acceptance_cmd.replace('bash ',''))));
 const guard=fs.readFileSync(path.join(root,'docs/rca/regression-guards.supabase.example.yaml'),'utf8');
 assert.ok(guard.includes('supabase/migrations/**'));assert.ok(guard.includes('not ** globs'));
 assert.ok(guard.includes('policy has a catalog comment'));assert.ok(guard.includes('RLS enabled'));
});
module.exports=run;
