'use strict';
const {load}=require('../../postgres/scripts/config');
const {check}=require('../../postgres/scripts/drift');
const {checkTypes}=require('./types');
try {
 if(process.argv.length>3 || (process.argv[2]||'').startsWith('-')) throw new Error('Usage: check-docs.sh [config.json]');
 const config=load(process.argv[2],{supabase:true});
 // Supabase requires RLS on every owned table, including non-exposed ones.
 config.exposed=[...new Set([...config.exposed,...config.owned])];
 check(config);checkTypes(config);console.log('Supabase documentation gate passed.');
} catch(e) {console.error(e.message);process.exit(1);}
