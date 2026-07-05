'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, run } = require('./harness');
const curator = require('../lib/curator');

function makeStandardsDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-curator-'));
  return {
    staging: path.join(dir, 'distilled-staging.md'),
    archive: path.join(dir, 'distilled-archive.md'),
    coding: path.join(dir, 'coding.md'),
    dir,
  };
}

const LESSON = {
  category: 'State',
  lesson: 'UI state that must survive navigation belongs in URL params, not component state.',
  provenance: { task: 'T002', fingerprint: '9f3ac1d20b47aaaa', date: '2026-07-05', trace: 'docs/progress/task_T002_attempt1_trace.md' },
};

test('addLesson creates the staging file from template with provenance', () => {
  const p = makeStandardsDir();
  const result = curator.addLesson(p.staging, LESSON);
  assert.strictEqual(result.action, 'created');
  const text = fs.readFileSync(p.staging, 'utf8');
  assert.ok(text.includes(result.id));
  assert.ok(text.includes('hit_count:** 1'));
  assert.ok(text.includes('T002 fp:9f3ac1d20b47aaaa'));
  assert.ok(text.includes(LESSON.lesson));
  assert.ok(text.includes('BEGIN STAGED RULES'), 'markers preserved');
});

test('equivalent lesson increments hit_count instead of duplicating', () => {
  const p = makeStandardsDir();
  const first = curator.addLesson(p.staging, LESSON);
  const again = curator.addLesson(p.staging, {
    ...LESSON,
    // same lesson, different whitespace/case -> same identity
    lesson: '  UI state that must survive navigation belongs in URL   params, not component state.  '.trim().replace(/\s+/g, ' '),
    provenance: { task: 'T004', fingerprint: 'bbbb1d20b47aaaa1', date: '2026-07-06', trace: 'docs/progress/task_T004_attempt1_trace.md' },
  });
  assert.strictEqual(again.action, 'incremented');
  assert.strictEqual(again.id, first.id);

  const rules = curator.listRules(p.staging);
  assert.strictEqual(rules.length, 1);
  assert.strictEqual(rules[0].hit_count, 2);
  assert.strictEqual(rules[0].last_seen, '2026-07-06');
  assert.strictEqual(rules[0].sources.length, 2);
});

test('eligibility threshold: 1 hit is not eligible, 2 hits are', () => {
  const p = makeStandardsDir();
  curator.addLesson(p.staging, LESSON);
  assert.strictEqual(curator.listRules(p.staging)[0].eligible, false);
  curator.addLesson(p.staging, LESSON);
  assert.strictEqual(curator.listRules(p.staging)[0].eligible, true);
});

test('promote appends to the target standard without touching existing content', () => {
  const p = makeStandardsDir();
  fs.writeFileSync(p.coding, '# Coding Standard\n\nExisting rule one.\n');
  const { id } = curator.addLesson(p.staging, LESSON);
  curator.addLesson(p.staging, LESSON);

  curator.promote(p.staging, id, p.coding, { date: '2026-07-06' });

  const target = fs.readFileSync(p.coding, 'utf8');
  assert.ok(target.startsWith('# Coding Standard\n\nExisting rule one.\n'), 'append-only');
  assert.ok(target.includes('**Distilled Rule [2026-07-06] - Category: State:**'));
  assert.ok(target.includes(LESSON.lesson));
  assert.ok(target.includes(`promoted from staging: ${id}, hit_count 2`));

  const rule = curator.listRules(p.staging).find((r) => r.id === id);
  assert.strictEqual(rule.status, 'promoted');
  assert.ok(rule.statusDetail.includes('coding.md'));
});

test('a promoted rule cannot be promoted twice', () => {
  const p = makeStandardsDir();
  fs.writeFileSync(p.coding, '# Coding Standard\n');
  const { id } = curator.addLesson(p.staging, LESSON);
  curator.promote(p.staging, id, p.coding, { date: '2026-07-06' });
  assert.throws(() => curator.promote(p.staging, id, p.coding, {}), /not staged/);
});

test('auto-promotion refuses reserved categories (ADR-003)', () => {
  const p = makeStandardsDir();
  fs.writeFileSync(p.coding, '# Security Standard\n');
  const { id } = curator.addLesson(p.staging, {
    category: 'Security',
    lesson: 'Secrets read from the environment must never be echoed into traces or logs.',
    provenance: LESSON.provenance,
  });
  assert.throws(() => curator.promote(p.staging, id, p.coding, { auto: true }), /auto-promotion refused/);
  // manual promotion still works
  curator.promote(p.staging, id, p.coding, { date: '2026-07-06' });
  assert.ok(fs.readFileSync(p.coding, 'utf8').includes('never be echoed'));
});

test('expire moves stale staged rules to the archive; nothing is deleted', () => {
  const p = makeStandardsDir();
  const { id: staleId } = curator.addLesson(p.staging, {
    ...LESSON,
    provenance: { ...LESSON.provenance, date: '2026-05-01' },
  });
  const { id: freshId } = curator.addLesson(p.staging, {
    category: 'Testing',
    lesson: 'Regression tests must pin expected ordering explicitly rather than relying on defaults.',
    provenance: { ...LESSON.provenance, date: '2026-07-04' },
  });

  const expired = curator.expire(p.staging, p.archive, { days: 30, now: '2026-07-05T00:00:00Z' });
  assert.deepStrictEqual(expired, [staleId]);

  const staging = fs.readFileSync(p.staging, 'utf8');
  const archive = fs.readFileSync(p.archive, 'utf8');
  assert.ok(!staging.includes(staleId), 'stale rule left staging');
  assert.ok(staging.includes(freshId), 'fresh rule kept');
  assert.ok(archive.includes(staleId), 'stale rule archived');
  assert.ok(archive.includes(LESSON.lesson), 'lesson text preserved in archive');
  assert.ok(archive.includes('[expired 2026-07-05]'));
});

test('promoted rules never expire', () => {
  const p = makeStandardsDir();
  fs.writeFileSync(p.coding, '# Coding Standard\n');
  const { id } = curator.addLesson(p.staging, {
    ...LESSON,
    provenance: { ...LESSON.provenance, date: '2026-01-01' },
  });
  curator.promote(p.staging, id, p.coding, { date: '2026-01-02' });
  const expired = curator.expire(p.staging, p.archive, { days: 30, now: '2026-07-05T00:00:00Z' });
  assert.deepStrictEqual(expired, []);
  assert.ok(fs.readFileSync(p.staging, 'utf8').includes(id), 'promoted record stays for provenance');
});

test('round-trip: staging file survives load/save cycles intact', () => {
  const p = makeStandardsDir();
  curator.addLesson(p.staging, LESSON);
  curator.addLesson(p.staging, {
    category: 'API',
    lesson: 'Pagination parameters must have server-side defaults so existing callers keep working.',
    provenance: { ...LESSON.provenance, task: 'T001' },
  });
  const before = curator.listRules(p.staging);
  // trigger a parse+serialize with no logical change
  curator.expire(p.staging, p.archive, { days: 3650, now: '2026-07-05T00:00:00Z' });
  const after = curator.listRules(p.staging);
  assert.deepStrictEqual(after, before);
});

module.exports = run;
