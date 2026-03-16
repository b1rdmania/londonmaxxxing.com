#!/usr/bin/env node

import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Read the ecosystem CSV
const csvContent = fs.readFileSync('./data/ecosystem.csv', 'utf-8');
const companies = parse(csvContent, { columns: true, skip_empty_lines: true });

console.log(`Total companies to research: ${companies.length}`);

// Output structure
const results = [];

// Process first batch of 10 companies as test
const batch = companies.slice(0, 10);

for (const company of batch) {
  console.log(`\nResearching: ${company.name} (${company.category})`);

  // For now, just structure the output - we'll add Perplexity API calls next
  results.push({
    company_id: company.id,
    company_name: company.name,
    company_category: company.category,
    company_website: company.website,
    team_members: [
      {
        name: 'TBD',
        title: 'TBD',
        linkedin_url: 'TBD',
        location: 'TBD'
      }
    ]
  });
}

// Save results
const outputPath = './linkedin_research_results.json';
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\nResults saved to: ${outputPath}`);

// Also create CSV format
const csvRows = [];
csvRows.push('Company ID,Company Name,Category,Website,Member Name,Title,LinkedIn URL,Location');

for (const result of results) {
  for (const member of result.team_members) {
    csvRows.push([
      result.company_id,
      result.company_name,
      result.company_category,
      result.company_website,
      member.name,
      member.title,
      member.linkedin_url,
      member.location
    ].join(','));
  }
}

const csvOutputPath = './linkedin_research_results.csv';
fs.writeFileSync(csvOutputPath, csvRows.join('\n'));
console.log(`CSV saved to: ${csvOutputPath}`);
