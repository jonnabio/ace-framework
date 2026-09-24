'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function configureFresh(targetDir) {
  const script = path.join(targetDir, '.ace/scripts/configure-scaffold.sh');
  if (!fs.existsSync(script)) throw new Error('Template is missing configure-scaffold.sh; update the template.');
  const r = spawnSync('bash', [path.resolve(script)], {cwd:targetDir, encoding:'utf8'});
  if (r.error || r.status !== 0) throw new Error('Scaffold configuration failed; Bash and a complete template are required.');
}

function updateIncludes(targetDir, packs) {
  const file = path.join(targetDir, '.aceconfig');
  let text = fs.readFileSync(file, 'utf8');
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const block = /^includes:[^\r\n]*\r?\n(?:[ \t]+-[^\r\n]*\r?\n)*/m;
  if (!block.test(text)) throw new Error('Missing includes block in .aceconfig');
  const unique = [...new Set(packs)];
  const replacement = unique.length ? 'includes:\n' + unique.map(p => `  - .ace/packs/${p}/.aceconfig-ext\n`).join('') : 'includes: []\n';
  text = text.replace(block, replacement.replace(/\n/g, newline));
  fs.writeFileSync(file, text);
}
module.exports = { configureFresh, updateIncludes };
