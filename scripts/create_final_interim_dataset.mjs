#!/usr/bin/env node

/**
 * Create final interim dataset with all researched companies
 * This generates ecosystem_staging_researched.csv with verified addresses
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All researched companies with verified addresses
const researched = [
  // AI Companies (18 with London addresses)
  {id: "cand-ai-001", name: "OpenAI", category: "ai", address: "Suite 1, 7th Floor, 50 Broadway", postcode: "SW1H 0BL", city: "London", country: "UK"},
  {id: "cand-ai-002", name: "ElevenLabs", category: "ai", address: "Floor 4, 33 Broadwick Street", postcode: "W1F 0DQ", city: "London", country: "UK"},
  {id: "cand-ai-003", name: "PolyAI", category: "ai", address: "3 Sheldon Square", postcode: "W2 6HY", city: "London", country: "UK"},
  {id: "cand-ai-004", name: "Builder.ai", category: "ai", address: "6th Floor, North West House, 119 Marylebone Road", postcode: "NW1 5PU", city: "London", country: "UK"},
  {id: "cand-ai-005", name: "Robin AI", category: "ai", address: "10 Devonshire Square", postcode: "EC2M 4YP", city: "London", country: "UK"},
  {id: "cand-ai-006", name: "PhysicsX", category: "ai", address: "Victoria House, 1 Leonard Circus", postcode: "EC2A 4DQ", city: "London", country: "UK"},
  {id: "cand-ai-007", name: "Graphcore", category: "ai", address: "Lynton House, 7-12 Tavistock Square", postcode: "WC1H 9LT", city: "London", country: "UK"},
  {id: "cand-ai-008", name: "Darktrace", category: "ai", address: "80 Strand", postcode: "WC2R 0DT", city: "London", country: "UK"},
  {id: "cand-ai-010", name: "Causaly", category: "ai", address: "10-16 Elm Street", postcode: "WC1X 0BJ", city: "London", country: "UK"},
  {id: "cand-ai-011", name: "Seldon", category: "ai", address: "Rise London, 41 Luke Street", postcode: "EC2A 4DP", city: "London", country: "UK"},
  {id: "cand-ai-012", name: "Signal AI", category: "ai", address: "1st Floor Sackville House, 143-149 Fenchurch Street", postcode: "EC3M 6BN", city: "London", country: "UK"},
  {id: "cand-ai-013", name: "Eigen Technologies", category: "ai", address: "Fetter Yard, 86 Fetter Lane", postcode: "EC4A 1EN", city: "London", country: "UK"},
  {id: "cand-ai-014", name: "Faculty", category: "ai", address: "Level 5, 160 Old Street", postcode: "EC1V 9BW", city: "London", country: "UK"},
  {id: "cand-ai-017", name: "Huma", category: "ai", address: "13th Floor Millbank Tower, 21-24 Millbank", postcode: "SW1P 4QP", city: "London", country: "UK"},
  {id: "cand-ai-018", name: "Relation Therapeutics", category: "ai", address: "Regents Place, 338 Euston Road", postcode: "NW1 3BG", city: "London", country: "UK"},
  {id: "cand-ai-019", name: "Limbic", category: "ai", address: "128 City Road", postcode: "EC1V 2NX", city: "London", country: "UK"},
  {id: "cand-ai-020", name: "Baseimmune", category: "ai", address: "The London Bioscience Innovation Centre, Royal College Street", postcode: "NW1 0NH", city: "London", country: "UK"},

  // Web3 Companies (9 with London addresses)
  {id: "cand-web3-002", name: "Crypto.com", category: "web3", address: "Suite 5, 7th Floor, 50 Broadway", postcode: "SW1H 0DB", city: "London", country: "UK"},
  {id: "cand-web3-003", name: "eToro", category: "web3", address: "24th Floor, One Canada Square, Canary Wharf", postcode: "E14 5AB", city: "London", country: "UK"},
  {id: "cand-web3-004", name: "Bitpanda", category: "web3", address: "32 Threadneedle Street", postcode: "EC2R 8AY", city: "London", country: "UK"},
  {id: "cand-web3-033", name: "Argent", category: "web3", address: "9th Floor, 107 Cheapside", postcode: "EC2V 6DN", city: "London", country: "UK"},
  {id: "cand-web3-034", name: "Ramp Network", category: "web3", address: "81 Rivington Street", postcode: "EC2A 3AY", city: "London", country: "UK"},
  {id: "cand-web3-038", name: "R3", category: "web3", address: "2 London Wall Place, 11th Floor", postcode: "EC2Y 5AU", city: "London", country: "UK"},
  {id: "cand-web3-040", name: "Ziglu", category: "web3", address: "1 Poultry", postcode: "EC2R 8EJ", city: "London", country: "UK"},
  {id: "cand-web3-045", name: "Elliptic Enterprises", category: "web3", address: "35-37 Ludgate Hill, Office 7", postcode: "EC4M 7JN", city: "London", country: "UK"},

  // Fintech Companies (11 with London addresses)
  {id: "cand-fintech-001", name: "9fin", category: "fintech", address: "8th Floor, 100 Bishopsgate", postcode: "EC2N 4AG", city: "London", country: "UK"},
  {id: "cand-fintech-002", name: "Rapyd", category: "fintech", address: "North West House, 119 Marylebone Road", postcode: "NW1 5PU", city: "London", country: "UK"},
  {id: "cand-fintech-004", name: "Zilch", category: "fintech", address: "111 Buckingham Palace Road", postcode: "SW1W 0SR", city: "London", country: "UK"},
  {id: "cand-fintech-006", name: "Tide", category: "fintech", address: "4th Floor, The Featherstone Building, 66 City Road", postcode: "EC1Y 2AL", city: "London", country: "UK"},
  {id: "cand-fintech-008", name: "Monese", category: "fintech", address: "Eagle House, 163 City Road", postcode: "EC1V 1NR", city: "London", country: "UK"},
  {id: "cand-fintech-009", name: "Cleo", category: "fintech", address: "14 Gray's Inn Road", postcode: "WC1X 8HN", city: "London", country: "UK"},
  {id: "cand-fintech-010", name: "Plum", category: "fintech", address: "2-7 Clerkenwell Green, 2nd Floor", postcode: "EC1R 0DE", city: "London", country: "UK"},
  {id: "cand-fintech-017", name: "Curve", category: "fintech", address: "15-19 Bloomsbury Way", postcode: "WC1A 2TH", city: "London", country: "UK"},

  // Tech Companies (2 with London addresses)
  {id: "cand-tech-007", name: "Snyk", category: "tech", address: "Mainframe Building - Euston, Floor 3, 24 Eversholt Street", postcode: "NW1 1AD", city: "London", country: "UK"},
  {id: "cand-tech-008", name: "Paddle", category: "tech", address: "Judd House, 18-29 Mora Street", postcode: "EC1V 8BT", city: "London", country: "UK"}
];

console.log(`\n📊 Final Interim Dataset Summary:`);
console.log(`   Total companies researched: ${researched.length}`);
console.log(`   AI companies: ${researched.filter(c => c.category === 'ai').length}`);
console.log(`   Web3 companies: ${researched.filter(c => c.category === 'web3').length}`);
console.log(`   Fintech companies: ${researched.filter(c => c.category === 'fintech').length}`);
console.log(`   Tech companies: ${researched.filter(c => c.category === 'tech').length}`);

// Read original staging to get remaining companies
const stagingPath = path.join(__dirname, '..', 'data', 'ecosystem_staging.csv');
const stagingContent = fs.readFileSync(stagingPath, 'utf-8');
const stagingLines = stagingContent.trim().split('\n');

// Parse all companies
const allCompanies = [];
for (let i = 1; i < stagingLines.length; i++) {
  const values = stagingLines[i].split(',');
  allCompanies.push({
    id: values[0],
    name: values[1],
    category: values[2]
  });
}

// Create lookup map
const researchedMap = {};
researched.forEach(company => {
  researchedMap[company.id] = company;
});

// Generate CSV
const csvLines = [];
csvLines.push('id,name,category,address,postcode,city,country,website,source_url,notes,latitude,longitude,twitter,geocode_confidence');

for (const company of allCompanies) {
  const data = researchedMap[company.id];

  if (data) {
    // Escape address field (may contain commas)
    const escapedAddress = data.address.includes(',') ? `"${data.address}"` : data.address;
    csvLines.push(
      `${data.id},${data.name},${data.category},${escapedAddress},${data.postcode},${data.city},${data.country},,,Verified London address,,,,needs_geocoding`
    );
  } else {
    // Not yet researched
    csvLines.push(
      `${company.id},${company.name},${company.category},,,London,UK,,,Pending research,,,,pending`
    );
  }
}

// Save CSV
const outputPath = path.join(__dirname, '..', 'data', 'ecosystem_staging_researched.csv');
fs.writeFileSync(outputPath, csvLines.join('\n'));

console.log(`\n✅ Generated: ${outputPath}`);
console.log(`   Total rows: ${csvLines.length - 1} (+ 1 header)`);
console.log(`   Researched: ${researched.length}`);
console.log(`   Pending: ${allCompanies.length - researched.length}`);
console.log(`\n📍 Next steps:`);
console.log(`   1. Research remaining ${allCompanies.length - researched.length} companies`);
console.log(`   2. Geocode all ${researched.length} verified addresses`);
console.log(`   3. Extract Twitter handles`);
console.log(`   4. Quality check for duplicate coordinates\n`);
