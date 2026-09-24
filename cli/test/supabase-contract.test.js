'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const {test,run}=require('./harness');
test('Supabase skill covers roles, platform inventory, exclusions and forward-only safety',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../../.ace/packs/supabase/supabase-documentation/SKILL.md'),'utf8');
 for(const term of ['anon','authenticated','service_role','pg_cron','pg_net','Realtime','Storage','auth','storage','realtime','extensions','vault','supabase_functions','graphql_public','compensating migration','Production is forbidden','local stack']) assert.ok(text.includes(term),term);
 for(const name of ['security-model','inventory','backup-pitr','key-rotation']) assert.ok(fs.readFileSync(path.join(__dirname,`../../.ace/packs/supabase/templates/${name}.md`),'utf8').length>300);
});
module.exports=run;
