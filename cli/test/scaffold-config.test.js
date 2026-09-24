'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { test, run } = require('./harness');
const { configureFresh, updateIncludes } = require('../lib/scaffold-config');
const root = path.resolve(__dirname, '../..');
test('actual fresh bootstrap passes without repository tooling and detects missing core files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-bootstrap-'));
  try {
    fs.cpSync(path.join(root,'.ace'), path.join(dir,'.ace'), {recursive:true});
    fs.cpSync(path.join(root,'docs'), path.join(dir,'docs'), {recursive:true});
    fs.copyFileSync(path.join(root,'.aceconfig'),path.join(dir,'.aceconfig'));
    configureFresh(dir); updateIncludes(dir, []);
    assert.ok(!fs.existsSync(path.join(dir,'docs/progress/tasks.json')));
    assert.match(fs.readFileSync(path.join(dir,'.aceconfig'),'utf8'), /docs_cmd: ""/);
    for (const args of [[], ['--fast']]) {
      const r=spawnSync('bash',['.ace/scripts/verify.sh',...args],{cwd:dir,encoding:'utf8'});
      assert.strictEqual(r.status,0,r.stdout+r.stderr);
    }
    fs.unlinkSync(path.join(dir,'.ace/roles/roles.md'));
    assert.notStrictEqual(spawnSync('bash',['.ace/scripts/verify.sh'],{cwd:dir}).status,0);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
test('includes reconciliation supports empty lists, CRLF and idempotence', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ace-includes-'));
  try {
    for (const newline of ['\n','\r\n']) {
      fs.writeFileSync(path.join(dir,'.aceconfig'), `includes: []${newline}verify:${newline}`);
      updateIncludes(dir,['postgres','supabase','postgres']);
      const first=fs.readFileSync(path.join(dir,'.aceconfig'),'utf8');
      updateIncludes(dir,['postgres','supabase']);
      assert.strictEqual(fs.readFileSync(path.join(dir,'.aceconfig'),'utf8'),first);
      assert.strictEqual((first.match(/postgres/g)||[]).length,1);
      updateIncludes(dir,[]);
      assert.strictEqual(fs.readFileSync(path.join(dir,'.aceconfig'),'utf8'),`includes: []${newline}verify:${newline}`);
    }
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
module.exports=run;
