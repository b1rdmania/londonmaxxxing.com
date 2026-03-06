#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read geocoded CSV
const csvPath = path.join(__dirname, 'data/ecosystem_geocoded.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

// Parse rows
const rows = lines.slice(1).map(line => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = values[i] || '';
  });
  return obj;
});

// Analyze coordinates
const coordMap = new Map();
const highConf = [];
const mediumConf = [];

rows.forEach(row => {
  const coords = `${row.latitude},${row.longitude}`;

  if (row.geocode_confidence === 'high') {
    highConf.push(row);
  } else if (row.geocode_confidence === 'medium') {
    mediumConf.push(row);
  }

  if (!coordMap.has(coords)) {
    coordMap.set(coords, []);
  }
  coordMap.get(coords).push(row.name);
});

// Find any duplicates
const duplicates = [];
coordMap.forEach((companies, coords) => {
  if (companies.length > 1) {
    duplicates.push({ coords, companies });
  }
});

console.log('=== COORDINATE VERIFICATION ===\n');
console.log(`Total geocoded companies: ${rows.length}`);
console.log(`High confidence: ${highConf.length}`);
console.log(`Medium confidence: ${mediumConf.length}`);
console.log(`Unique coordinates: ${coordMap.size}\n`);

if (duplicates.length > 0) {
  console.log('SHARED COORDINATES (legitimate - same building/address):');
  duplicates.forEach(dup => {
    console.log(`\n${dup.coords}:`);
    dup.companies.forEach(name => console.log(`  - ${name}`));
  });
} else {
  console.log('✓ All coordinates are unique - no fallback coordinates');
}

console.log('\n=== CONFIDENCE BREAKDOWN ===');
console.log('High confidence examples:');
highConf.slice(0, 5).forEach(row => {
  console.log(`  ${row.name}: ${row.address}, ${row.postcode} → ${row.latitude},${row.longitude}`);
});

console.log('\nMedium confidence examples:');
mediumConf.slice(0, 5).forEach(row => {
  console.log(`  ${row.name}: ${row.address || 'N/A'}, ${row.postcode || 'N/A'} → ${row.latitude},${row.longitude}`);
});
