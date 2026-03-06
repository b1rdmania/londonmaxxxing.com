#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const csvPath = path.join(root, 'data', 'ecosystem.csv');
const runLive = process.argv.includes('--live');

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { current += '"'; i += 1; } else { inQuotes = !inQuotes; }
      continue;
    }
    if (ch === ',' && !inQuotes) { row.push(current.trim()); current = ''; continue; }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(current.trim()); current = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
      continue;
    }
    current += ch;
  }
  if (current.length || row.length) { row.push(current.trim()); if (row.some(Boolean)) rows.push(row); }
  if (!rows.length) return [];
  const [headers, ...data] = rows;
  return data.map((vals) => {
    const out = {};
    headers.forEach((h, i) => (out[h] = vals[i] ?? ''));
    return out;
  });
}

function isHttpUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseTwitterHandle(value) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const u = new URL(v);
      const host = u.hostname.replace(/^www\./, '').toLowerCase();
      if (host !== 'x.com' && host !== 'twitter.com') return null;
      const seg = u.pathname.split('/').filter(Boolean)[0] || '';
      return seg.replace(/^@/, '') || null;
    } catch {
      return null;
    }
  }
  return v.replace(/^@/, '');
}

async function checkUrlLive(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    clearTimeout(timeout);
    return { ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch {
    return { ok: false, status: 'ERR' };
  }
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`Missing file: ${csvPath}`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const issues = [];
  let checked = 0;

  for (const row of rows) {
    const id = row.id || '(no-id)';
    const name = row.name || '(no-name)';

    for (const field of ['website', 'source_url']) {
      const value = (row[field] || '').trim();
      if (!value) {
        issues.push({ severity: field === 'source_url' ? 'error' : 'warn', id, name, field, value, reason: 'missing' });
        continue;
      }
      if (!isHttpUrl(value)) {
        issues.push({ severity: 'error', id, name, field, value, reason: 'invalid_url' });
        continue;
      }
      if (runLive) {
        checked += 1;
        const r = await checkUrlLive(value);
        if (!r.ok) issues.push({ severity: 'warn', id, name, field, value, reason: `http_${r.status}` });
      }
    }

    if ('twitter' in row) {
      const tv = (row.twitter || '').trim();
      if (tv) {
        const handle = parseTwitterHandle(tv);
        if (!handle) {
          issues.push({ severity: 'warn', id, name, field: 'twitter', value: tv, reason: 'invalid_handle_or_url' });
        } else if (runLive) {
          checked += 1;
          const url = `https://x.com/${handle}`;
          const r = await checkUrlLive(url);
          if (!r.ok) issues.push({ severity: 'warn', id, name, field: 'twitter', value: tv, reason: `x_http_${r.status}` });
        }
      }
    }
  }

  const outPath = path.join(root, 'data', 'link-audit-report.md');
  const lines = [];
  lines.push('# Link Audit Report');
  lines.push('');
  lines.push(`- Rows: ${rows.length}`);
  lines.push(`- Mode: ${runLive ? 'live (HTTP checks)' : 'static (format checks only)'}`);
  lines.push(`- URLs checked live: ${checked}`);
  lines.push(`- Issues: ${issues.length}`);
  lines.push('');
  lines.push('| severity | id | name | field | reason | value |');
  lines.push('|---|---|---|---|---|---|');
  for (const i of issues) {
    lines.push(`| ${i.severity} | ${i.id} | ${i.name} | ${i.field} | ${i.reason} | ${(i.value || '').replace(/\|/g, '\\|')} |`);
  }
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  const errCount = issues.filter((i) => i.severity === 'error').length;
  const warnCount = issues.filter((i) => i.severity === 'warn').length;
  console.log(`rows=${rows.length} issues=${issues.length} errors=${errCount} warns=${warnCount}`);
  console.log(`report=${outPath}`);

  process.exit(errCount > 0 ? 2 : 0);
}

main();
