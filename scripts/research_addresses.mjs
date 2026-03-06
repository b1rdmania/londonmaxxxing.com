#!/usr/bin/env node

/**
 * Address Research Script
 *
 * For each company in ecosystem_staging.csv:
 * 1. Search for official address (Companies House, Google Maps)
 * 2. Extract address, postcode
 * 3. Geocode via Google Maps Geocoding API
 * 4. Find Twitter handle if possible
 *
 * Outputs: ecosystem_staging_researched.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the staging CSV
const csvPath = path.join(__dirname, '..', 'data', 'ecosystem_staging.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

console.log(`Found ${lines.length - 1} companies to research`);
console.log(`\nHeaders: ${headers.join(', ')}`);

// Parse CSV
const companies = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const values = line.split(',');

  const company = {
    id: values[0],
    name: values[1],
    category: values[2],
    address: values[3],
    postcode: values[4],
    city: values[5],
    country: values[6],
    website: values[7],
    source_url: values[8],
    notes: values[9],
    latitude: values[10],
    longitude: values[11],
    twitter: values[12],
    geocode_confidence: values[13]
  };

  companies.push(company);
}

console.log(`\nParsed ${companies.length} companies`);
console.log(`\nFirst company: ${JSON.stringify(companies[0], null, 2)}`);
console.log(`\nLast company: ${JSON.stringify(companies[companies.length - 1], null, 2)}`);

// Output the list for manual research
console.log(`\n\n=== COMPANIES TO RESEARCH ===\n`);
companies.forEach((company, idx) => {
  console.log(`${idx + 1}. ${company.name} (${company.category})`);
});

console.log(`\n\nTotal: ${companies.length} companies`);
console.log(`\nNext step: Create research batch file for systematic address lookup`);
