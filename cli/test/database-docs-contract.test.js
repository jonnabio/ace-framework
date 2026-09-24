'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { test, run } = require('./harness');
const read = p => fs.readFileSync(path.join(__dirname, '../..', p), 'utf8');
test('core routes schema documentation to a valid generic skill', () => {
  const skill = read('.ace/skills/database-documentation/SKILL.md');
  assert.match(skill, /^---\nname: database-documentation\ndescription: .+\n---/);
  for (const trigger of ['schema-docs', 'data-dictionary']) assert.ok(read('.aceconfig').includes(trigger + ': .ace/skills/database-documentation/SKILL.md'));
  assert.ok(read('.ace/skills/documentation-generation/SKILL.md').includes('Schema documentation: apply'));
  for (const term of ['classification:', 'pii:', 'source of truth', 'Never edit', 'coverage manifest']) assert.ok(skill.includes(term), term);
});
test('migration recovery is tool-dependent and entities do not duplicate columns', () => {
  const migration = read('.ace/skills/database-operations/SKILL.md');
  assert.ok(migration.includes('Reversible tools'));
  assert.ok(migration.includes('compensating migration'));
  assert.ok(!migration.includes('Always test DOWN'));
  assert.ok(migration.includes('Regenerate schema reference and pass the docs gate'));
  const entities = read('.ace/knowledge/entities.md');
  assert.ok(entities.includes('docs/database/reference/README.md'));
  assert.ok(!entities.includes('| Attribute |'));
});
module.exports = run;
