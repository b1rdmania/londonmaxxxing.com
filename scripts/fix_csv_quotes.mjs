#!/usr/bin/env node
import fs from 'fs';
import Papa from 'papaparse';

// Read the CSV
const csv = fs.readFileSync('data/ecosystem.csv', 'utf8');

// Parse it (handles quotes correctly)
const parsed = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true
});

console.log('Parsed', parsed.data.length, 'rows');
console.log('Errors:', parsed.errors.length);

if (parsed.errors.length > 0) {
  console.log('\nFirst 5 errors:');
  parsed.errors.slice(0, 5).forEach(e => console.log(' ', e));
}

// Write it back with proper quoting
const output = Papa.unparse(parsed.data, {
  quotes: true, // Quote all fields
  quoteChar: '"',
  escapeChar: '"',
  header: true
});

fs.writeFileSync('data/ecosystem.csv', output + '\n');
console.log('\n✓ Rewrote CSV with proper quoting');
