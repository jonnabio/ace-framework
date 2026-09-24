'use strict';
const fs=require('fs'),path=require('path');
const {run,load}=require('./config');
const {generate}=require('./reference');
function git(config,args) { return run('git',args,{cwd:config.root}); }
function assertClean(config, target=config.output) {
  if(fs.realpathSync(git(config,['rev-parse','--show-toplevel']).trim())!==fs.realpathSync(config.root)) throw new Error('Run the docs gate from the Git repository root');
  git(config,['rev-parse','--verify','HEAD']);
  const relative=path.relative(config.root,target).split(path.sep).join('/');
  if(!fs.existsSync(target) || !git(config,['ls-tree','-r','--name-only','HEAD','--',relative]).trim()) throw new Error('Missing committed generated baseline; generate, review and commit first');
  if(git(config,['status','--porcelain','--untracked-files=all','--ignored','--',relative]).trim()) throw new Error('Generated baseline has staged, unstaged, untracked or ignored changes; review and commit first');
  return relative;
}
function check(config) {
  const relative=assertClean(config);
  generate(config);
  git(config,['diff','--exit-code','HEAD','--',relative]);
  if(git(config,['status','--porcelain','--untracked-files=all','--ignored','--',relative]).trim()) throw new Error('Generated reference drift: added, deleted, changed or ignored artifacts');
}
module.exports={check,assertClean,git};
if(require.main===module) {
 try {if(process.argv.length>3) throw new Error('Usage: check-docs.sh [config.json]');check(load(process.argv[2]));console.log('Database documentation gate passed.');}
 catch(e){console.error(e.message);process.exit(1);}
}
