/**
 * curator.js — distilled rule lifecycle (Implementation Plan v2.7, T008; ADR-003).
 *
 * Lessons from the Reflector land in .ace/standards/distilled-staging.md,
 * deduplicated by rule identity (fingerprint of normalized category+lesson).
 * Rules earn promotion into real standards through evidence (hit_count) and
 * human confirmation; stale rules expire to an append-only archive.
 *
 * Anti-collapse invariant: real standards files are only ever APPENDED to,
 * in the same format update_harness.sh uses. Staging and archive are the
 * only files this module rewrites, and both remain human-readable markdown.
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BEGIN_MARK = '<!-- BEGIN STAGED RULES -->';
const END_MARK = '<!-- END STAGED RULES -->';
const PROMOTION_THRESHOLD = 2;          // ADR-003 §4
const DEFAULT_EXPIRY_DAYS = 30;         // ADR-003 §6
const RESERVED_CATEGORIES = ['security', 'data-loss', 'compliance']; // ADR-003 §5

const STAGING_TEMPLATE = `# Distilled Rules — Staging (Curator)

> **Status**: Active (v2.7 Loop Engineering)
> **Lifecycle**: staged → promoted | expired (ADR-003)
>
> Reflector lessons land here with provenance and hit counts. Nothing in
> this file is a standard yet. Rules become standards only through
> \`ace-framework curate promote\` (human-confirmed by default; eligible at
> hit_count >= 2). Rules that do not re-fire within 30 days are moved to
> \`distilled-archive.md\` by \`ace-framework curate expire\`.
>
> This file is managed by the Curator tooling. Humans may edit rule WORDING
> in place (white-box auditing) but should not add or remove entries by
> hand — use the tooling so identity and provenance stay consistent.

${BEGIN_MARK}
${END_MARK}
`;

const ARCHIVE_HEADER = `# Distilled Rules — Archive

> Rules expired from staging (no re-fire within the expiry window, ADR-003).
> Append-only: nothing is deleted. A rule can be re-staged by a new
> occurrence of the same lesson.

`;

// --- identity ---

function ruleId(category, lesson) {
  const normalized = `${category}|${lesson}`.toLowerCase().replace(/\s+/g, ' ').trim();
  return `RULE-${crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12)}`;
}

function isReservedCategory(category) {
  return RESERVED_CATEGORIES.includes(String(category).toLowerCase());
}

// --- staging file parsing/serialization ---

function loadStaging(filePath) {
  const text = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : STAGING_TEMPLATE;
  const begin = text.indexOf(BEGIN_MARK);
  const end = text.indexOf(END_MARK);
  if (begin === -1 || end === -1 || end < begin) {
    throw new Error(`${filePath}: staged-rules markers missing or malformed; restore ${BEGIN_MARK} / ${END_MARK}`);
  }
  const header = text.slice(0, begin + BEGIN_MARK.length);
  const footer = text.slice(end);
  const body = text.slice(begin + BEGIN_MARK.length, end);

  const rules = [];
  const sections = body.split(/^## /m).slice(1);
  for (const section of sections) {
    const lines = section.split(/\r?\n/);
    const head = lines[0].match(/^(RULE-[a-f0-9]{12})\s+\[([a-z]+)(?:\s+([^\]]+))?\]/);
    if (!head) continue;
    const rule = {
      id: head[1],
      status: head[2],
      statusDetail: head[3] || null,
      category: null,
      hit_count: 0,
      first_seen: null,
      last_seen: null,
      sources: [],
      lesson: null,
    };
    for (const line of lines.slice(1)) {
      let m;
      if ((m = line.match(/^-\s+\*\*category:\*\*\s+(.+)$/))) rule.category = m[1].trim();
      else if ((m = line.match(/^-\s+\*\*hit_count:\*\*\s+(\d+)$/))) rule.hit_count = Number(m[1]);
      else if ((m = line.match(/^-\s+\*\*first_seen:\*\*\s+(.+)$/))) rule.first_seen = m[1].trim();
      else if ((m = line.match(/^-\s+\*\*last_seen:\*\*\s+(.+)$/))) rule.last_seen = m[1].trim();
      else if ((m = line.match(/^-\s+\*\*source:\*\*\s+(.+)$/))) rule.sources.push(m[1].trim());
      else if ((m = line.match(/^>\s+(.*)$/))) rule.lesson = rule.lesson ? `${rule.lesson} ${m[1]}` : m[1];
    }
    if (rule.category && rule.lesson) rules.push(rule);
  }
  return { header, footer, rules };
}

function serializeRule(rule) {
  const status = rule.statusDetail ? `[${rule.status} ${rule.statusDetail}]` : `[${rule.status}]`;
  const lines = [
    `## ${rule.id} ${status}`,
    '',
    `- **category:** ${rule.category}`,
    `- **hit_count:** ${rule.hit_count}`,
    `- **first_seen:** ${rule.first_seen}`,
    `- **last_seen:** ${rule.last_seen}`,
    ...rule.sources.map((s) => `- **source:** ${s}`),
    '',
    `> ${rule.lesson}`,
    '',
  ];
  return lines.join('\n');
}

function saveStaging(filePath, parsed) {
  const body = parsed.rules.length
    ? `\n\n${parsed.rules.map(serializeRule).join('\n')}\n`
    : '\n';
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${parsed.header}${body}${parsed.footer}`);
}

// --- lifecycle operations ---

/**
 * Add a distilled lesson (the Reflector sink). Deduplicates by rule identity:
 * an equivalent lesson increments hit_count and records the new source.
 * @returns {{id: string, action: 'created'|'incremented'|'restaged'}}
 */
function addLesson(filePath, { category, lesson, provenance }) {
  const parsed = loadStaging(filePath);
  const id = ruleId(category, lesson);
  const today = (provenance && provenance.date) || new Date().toISOString().slice(0, 10);
  const source = provenance
    ? `${provenance.task} fp:${provenance.fingerprint} trace:${provenance.trace}`
    : 'unknown';

  const existing = parsed.rules.find((r) => r.id === id);
  if (existing) {
    existing.hit_count += 1;
    existing.last_seen = today;
    existing.sources.push(source);
    const action = existing.status === 'staged' ? 'incremented' : 'restaged';
    existing.status = existing.status === 'promoted' ? 'promoted' : 'staged';
    saveStaging(filePath, parsed);
    return { id, action };
  }

  parsed.rules.push({
    id,
    status: 'staged',
    statusDetail: null,
    category,
    hit_count: 1,
    first_seen: today,
    last_seen: today,
    sources: [source],
    lesson,
  });
  saveStaging(filePath, parsed);
  return { id, action: 'created' };
}

/**
 * List staged rules with promotion eligibility (ADR-003 §4).
 */
function listRules(filePath) {
  const parsed = loadStaging(filePath);
  return parsed.rules.map((r) => ({
    ...r,
    eligible: r.status === 'staged' && r.hit_count >= PROMOTION_THRESHOLD,
    reserved: isReservedCategory(r.category),
  }));
}

/**
 * Promote a staged rule into a real standard: APPEND-ONLY write to the
 * target, in the update_harness.sh format, with provenance. Marks the
 * staged entry [promoted → target].
 */
function promote(filePath, id, targetFile, opts) {
  const auto = Boolean(opts && opts.auto);
  const today = (opts && opts.date) || new Date().toISOString().slice(0, 10);
  const parsed = loadStaging(filePath);
  const rule = parsed.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`No staged rule ${id} in ${filePath}`);
  if (rule.status !== 'staged') throw new Error(`${id} is not staged (status: ${rule.status})`);
  if (auto && isReservedCategory(rule.category)) {
    throw new Error(`${id} has reserved category "${rule.category}" - auto-promotion refused; promote manually (ADR-003)`);
  }
  if (!fs.existsSync(targetFile)) throw new Error(`Target standard not found: ${targetFile}`);

  const appendix = [
    '',
    '---',
    `> **Distilled Rule [${today}] - Category: ${rule.category}:**`,
    `> ${rule.lesson}`,
    `> _(promoted from staging: ${rule.id}, hit_count ${rule.hit_count}, sources: ${rule.sources.map((s) => s.split(' ')[0]).join(', ')})_`,
    '',
  ].join('\n');
  fs.appendFileSync(targetFile, appendix);

  rule.status = 'promoted';
  rule.statusDetail = `${today} → ${path.basename(targetFile)}`;
  saveStaging(filePath, parsed);
  return { id, target: targetFile };
}

/**
 * Move staged rules that have not re-fired within the window to the
 * append-only archive. Promoted rules never expire (ADR-003 §6).
 * @returns {string[]} ids of expired rules
 */
function expire(filePath, archivePath, opts) {
  const days = (opts && opts.days) || DEFAULT_EXPIRY_DAYS;
  const now = (opts && opts.now) ? new Date(opts.now) : new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const parsed = loadStaging(filePath);

  const keep = [];
  const expired = [];
  for (const rule of parsed.rules) {
    const lastSeen = new Date(`${(rule.last_seen || '1970-01-01').split(' ')[0]}T00:00:00Z`);
    if (rule.status === 'staged' && lastSeen < cutoff) expired.push(rule);
    else keep.push(rule);
  }
  if (expired.length === 0) return [];

  if (!fs.existsSync(archivePath)) {
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });
    fs.writeFileSync(archivePath, ARCHIVE_HEADER);
  }
  const stamp = now.toISOString().slice(0, 10);
  for (const rule of expired) {
    rule.status = 'expired';
    rule.statusDetail = stamp;
    fs.appendFileSync(archivePath, `\n${serializeRule(rule)}`);
  }

  parsed.rules = keep;
  saveStaging(filePath, parsed);
  return expired.map((r) => r.id);
}

module.exports = {
  addLesson, listRules, promote, expire, ruleId, isReservedCategory,
  loadStaging, PROMOTION_THRESHOLD, DEFAULT_EXPIRY_DAYS, RESERVED_CATEGORIES,
};
