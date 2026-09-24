'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { test, run } = require('./harness');

const ROOT = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

test('public guides document core routing, pack dependency and activation', () => {
  for (const file of ['SKILLS_GUIDE.md', 'USER_GUIDE.md', 'ACE-SPEC.md']) {
    const text = read(file);
    assert.ok(text.includes('database-documentation'), `${file}: core skill`);
    assert.ok(text.includes('docs_cmd'), `${file}: optional gate`);
    assert.ok(text.includes('--pack postgres'), `${file}: PostgreSQL install`);
    assert.ok(text.includes('--pack supabase'), `${file}: Supabase install`);
  }
  assert.ok(read('USER_GUIDE.md').includes('compensating migration'));
  assert.ok(read('ACE-SPEC.md').includes('installs PostgreSQL too')
    || read('ACE-SPEC.md').includes('depends on PostgreSQL'));
});

test('IDE routing and documented executable paths exist', () => {
  for (const file of ['.aceconfig', '.aiconfig']) {
    const text = read(file);
    for (const trigger of ['schema-docs', 'data-dictionary']) {
      assert.ok(text.includes(`${trigger}: .ace/skills/database-documentation/SKILL.md`));
    }
  }
  for (const file of [
    '.ace/skills/database-documentation/SKILL.md',
    '.ace/packs/postgres/scripts/check-docs.sh',
    '.ace/packs/supabase/scripts/check-docs.sh',
  ]) assert.ok(fs.existsSync(path.join(ROOT, file)), file);
});

test('framework examples contain placeholders and no connection URL literals', () => {
  for (const file of [
    '.ace/packs/postgres/README.md',
    '.ace/packs/postgres/config.example.json',
    '.ace/packs/supabase/README.md',
  ]) {
    assert.doesNotMatch(read(file), /(?:postgres(?:ql)?|pg):\/\//i, file);
  }
});

module.exports = run;
