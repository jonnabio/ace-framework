'use strict';
const fs=require('fs'),path=require('path');
const DEPENDENCIES=Object.freeze({'scientific':[], 'ai-research':[], 'postgres':[], 'supabase':['postgres']});
function resolvePacks(name) {
  if(!name) return [];
  const normalized=String(name).toLowerCase();
  if(!Object.prototype.hasOwnProperty.call(DEPENDENCIES,normalized)) throw new Error('Unknown expansion pack; choose scientific, ai-research, postgres or supabase');
  return [...DEPENDENCIES[normalized],normalized];
}
function installPacks(targetDir,name) {
  const packs=resolvePacks(name),dir=path.join(targetDir,'.ace/packs');
  // Validate the whole dependency closure before deleting anything.
  for(const pack of packs) {
    if(!fs.existsSync(path.join(dir,pack,'.aceconfig-ext'))) throw new Error(`Missing expansion pack dependency: ${pack}; update the template source`);
  }
  if(fs.existsSync(dir)) {
    for(const entry of fs.readdirSync(dir)) if(!packs.includes(entry)) fs.rmSync(path.join(dir,entry),{recursive:true,force:true});
    if(!packs.length) fs.rmSync(dir,{recursive:true,force:true});
  }
  return packs;
}
module.exports={resolvePacks,installPacks};
