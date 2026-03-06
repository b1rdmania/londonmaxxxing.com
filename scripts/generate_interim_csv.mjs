#!/usr/bin/env node

/**
 * Generate interim CSV with researched companies so far
 * Merges research_progress.json data into CSV format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read research progress
const progressPath = path.join(__dirname, '..', 'data', 'research_progress.json');
const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));

// Read original staging CSV to get all companies
const stagingPath = path.join(__dirname, '..', 'data', 'ecosystem_staging.csv');
const stagingContent = fs.readFileSync(stagingPath, 'utf-8');
const stagingLines = stagingContent.trim().split('\n');

// Parse staging CSV
const allCompanies = [];
for (let i = 1; i < stagingLines.length; i++) {
  const values = stagingLines[i].split(',');
  allCompanies.push({
    id: values[0],
    name: values[1],
    category: values[2]
  });
}

console.log(`Total companies: ${allCompanies.length}`);
console.log(`Researched companies: ${progress.researched_companies.length}`);

// Create lookup map
const researchedMap = {};
progress.researched_companies.forEach(company => {
  researchedMap[company.id] = company;
});

// Generate CSV
const csvLines = [];
csvLines.push('id,name,category,address,postcode,city,country,website,source_url,notes,latitude,longitude,twitter,geocode_confidence');

for (const company of allCompanies) {
  const researched = researchedMap[company.id];

  if (researched && researched.address && researched.postcode) {
    // Company has been researched with address
    csvLines.push(
      `${company.id},${company.name},${company.category},"${researched.address}",${researched.postcode},${researched.city},${researched.country},,,${researched.notes || ''},,,,needs_geocoding`
    );
  } else if (researched && researched.notes) {
    // Company researched but no address found
    csvLines.push(
      `${company.id},${company.name},${company.category},,,London,UK,,,${researched.notes},,,,not_found`
    );
  } else {
    // Not yet researched
    csvLines.push(
      `${company.id},${company.name},${company.category},,,London,UK,,,Not yet researched,,,,pending`
    );
  }
}

// Save interim CSV
const outputPath = path.join(__dirname, '..', 'data', 'ecosystem_interim_researched.csv');
fs.writeFileSync(outputPath, csvLines.join('\n'));

console.log(`\n✅ Generated interim CSV: ${outputPath}`);
console.log(`   Companies with addresses: ${Object.values(researchedMap).filter(c => c.address && c.postcode).length}`);
console.log(`   Companies not found: ${Object.values(researchedMap).filter(c => !c.address || !c.postcode).length}`);
console.log(`   Companies pending: ${allCompanies.length - progress.researched_companies.length}`);
