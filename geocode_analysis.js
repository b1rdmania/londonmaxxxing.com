#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read and parse CSV
const csvPath = path.join(__dirname, 'data/ecosystem.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

// Parse CSV rows
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

// Analyze geocoding confidence
const FALLBACK_COORD = '51.5074,-0.1278';
const analysis = {
  high: [],
  medium: [],
  low: [],
  needsGeocoding: []
};

rows.forEach(row => {
  const hasAddress = row.address && row.address !== 'London' && row.address.trim().length > 10;
  const hasPostcode = row.postcode && row.postcode.trim().length > 0;
  const coords = `${row.latitude},${row.longitude}`;
  const isFallback = coords === FALLBACK_COORD;

  // Confidence classification
  if (hasAddress && hasPostcode && !isFallback) {
    // Has both address and postcode with actual coordinates
    analysis.high.push({
      id: row.id,
      name: row.name,
      address: row.address,
      postcode: row.postcode,
      coords: coords,
      reason: 'Has full address + postcode with verified coordinates'
    });
  } else if ((hasAddress || hasPostcode) && !isFallback) {
    // Has either address or postcode with coordinates
    analysis.medium.push({
      id: row.id,
      name: row.name,
      address: row.address,
      postcode: row.postcode,
      coords: coords,
      reason: 'Has partial address info with coordinates'
    });
  } else if ((hasAddress || hasPostcode) && isFallback) {
    // Has address data but using fallback - needs real geocoding
    analysis.needsGeocoding.push({
      id: row.id,
      name: row.name,
      address: row.address,
      postcode: row.postcode,
      coords: coords,
      reason: 'Has address info but using fallback coordinate'
    });
  } else {
    // Only has "London" or no address - low confidence
    analysis.low.push({
      id: row.id,
      name: row.name,
      address: row.address,
      postcode: row.postcode,
      coords: coords,
      reason: 'Generic location only (London) - needs research'
    });
  }
});

// Output analysis
console.log('=== GEOCODING ANALYSIS ===\n');
console.log(`Total companies: ${rows.length}`);
console.log(`High confidence: ${analysis.high.length} (exact address + postcode)`);
console.log(`Medium confidence: ${analysis.medium.length} (partial address info)`);
console.log(`Needs geocoding: ${analysis.needsGeocoding.length} (has address but using fallback)`);
console.log(`Low confidence: ${analysis.low.length} (generic location only)\n`);

console.log('=== NEEDS GEOCODING (has address but using fallback) ===');
analysis.needsGeocoding.slice(0, 10).forEach(item => {
  console.log(`${item.id}: ${item.name}`);
  console.log(`  Address: ${item.address}`);
  console.log(`  Postcode: ${item.postcode}`);
  console.log(`  Current: ${item.coords} (FALLBACK)`);
  console.log('');
});

console.log(`... and ${analysis.needsGeocoding.length - 10} more\n`);

console.log('=== LOW CONFIDENCE (only generic location) ===');
analysis.low.slice(0, 10).forEach(item => {
  console.log(`${item.id}: ${item.name}`);
  console.log(`  Address: ${item.address}`);
  console.log(`  Postcode: ${item.postcode}`);
  console.log('');
});

console.log(`... and ${analysis.low.length - 10} more\n`);

// Save detailed analysis
fs.writeFileSync(
  path.join(__dirname, 'geocode_analysis.json'),
  JSON.stringify(analysis, null, 2)
);
console.log('Detailed analysis saved to geocode_analysis.json');
