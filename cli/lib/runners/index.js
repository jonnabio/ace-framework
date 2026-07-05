/**
 * runners/index.js — runner adapter registry (ADR-002).
 *
 * Discovery is file-drop: every .js file in this directory except index.js
 * is an adapter. Adding a runner requires zero changes to loop.js or the CLI.
 */

'use strict';

const fs = require('fs');
const path = require('path');

function loadRunners() {
  const runners = new Map();
  const files = fs.readdirSync(__dirname)
    .filter((f) => f.endsWith('.js') && f !== 'index.js')
    .sort();
  for (const file of files) {
    const adapter = require(path.join(__dirname, file));
    if (adapter && typeof adapter.name === 'string' && typeof adapter.run === 'function') {
      runners.set(adapter.name, adapter);
    }
  }
  return runners;
}

function listRunners() {
  return [...loadRunners().keys()];
}

function getRunner(name) {
  const runners = loadRunners();
  const runner = runners.get(name);
  if (!runner) {
    throw new Error(
      `Unknown runner "${name}". Available runners: ${[...runners.keys()].join(', ') || '(none)'}. `
      + 'Set defaults.runner in docs/progress/tasks.json or pass --runner.',
    );
  }
  return runner;
}

module.exports = { getRunner, listRunners, loadRunners };
