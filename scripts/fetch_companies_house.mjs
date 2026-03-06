#!/usr/bin/env node

/**
 * Fetch addresses from Companies House API
 *
 * For each company, search Companies House and get registered office address.
 * Companies House is the authoritative source for UK company addresses.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPANIES_HOUSE_API = 'https://api.company-information.service.gov.uk';
const DELAY_MS = 100; // Rate limit: 10 requests/sec max, we'll do slower

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Search for a company
async function searchCompany(companyName) {
  const searchUrl = `${COMPANIES_HOUSE_API}/search/companies?q=${encodeURIComponent(companyName)}`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error(`  ❌ Search failed for "${companyName}": ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`  ⚠️  No results for "${companyName}"`);
      return null;
    }

    // Filter for London companies and active status
    const londonCompanies = data.items.filter(item => {
      const address = item.address;
      if (!address) return false;

      const locality = (address.locality || '').toLowerCase();
      const region = (address.region || '').toLowerCase();
      const postalCode = (address.postal_code || '').toLowerCase();

      // Check if London-based
      const isLondon = locality.includes('london') ||
                       region.includes('london') ||
                       postalCode.match(/^(e|ec|n|nw|se|sw|w|wc)\d/i);

      return isLondon && item.company_status === 'active';
    });

    if (londonCompanies.length === 0) {
      console.log(`  ⚠️  No London-based results for "${companyName}"`);
      return data.items[0]; // Return first result anyway as fallback
    }

    // Return first London-based active company
    return londonCompanies[0];
  } catch (error) {
    console.error(`  ❌ Error searching "${companyName}":`, error.message);
    return null;
  }
}

// Format address from Companies House format
function formatAddress(chAddress) {
  if (!chAddress) return null;

  const parts = [];

  // Address line 1 (care of, PO box, premises, address line 1)
  if (chAddress.care_of) parts.push(chAddress.care_of);
  if (chAddress.po_box) parts.push(`PO Box ${chAddress.po_box}`);
  if (chAddress.premises) parts.push(chAddress.premises);
  if (chAddress.address_line_1) parts.push(chAddress.address_line_1);
  if (chAddress.address_line_2) parts.push(chAddress.address_line_2);

  // Locality (town/city)
  if (chAddress.locality) parts.push(chAddress.locality);

  // Region (county)
  if (chAddress.region) parts.push(chAddress.region);

  // Country
  if (chAddress.country) parts.push(chAddress.country);

  const fullAddress = parts.join(', ');
  const postcode = chAddress.postal_code || '';

  return {
    address: fullAddress,
    postcode: postcode,
    raw: chAddress
  };
}

// Main function
async function main() {
  // Read staging CSV
  const csvPath = path.join(__dirname, '..', 'data', 'ecosystem_staging.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  // Parse companies
  const companies = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    companies.push({
      id: values[0],
      name: values[1],
      category: values[2]
    });
  }

  console.log(`🔍 Researching ${companies.length} companies via Companies House API\n`);

  const results = [];

  // Process each company
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    console.log(`[${i + 1}/${companies.length}] ${company.name}`);

    const result = await searchCompany(company.name);

    if (result) {
      const formattedAddress = formatAddress(result.address);

      results.push({
        id: company.id,
        name: company.name,
        category: company.category,
        company_number: result.company_number,
        company_status: result.company_status,
        title: result.title,
        address: formattedAddress?.address || '',
        postcode: formattedAddress?.postcode || '',
        raw_address: formattedAddress?.raw || null
      });

      console.log(`  ✅ ${formattedAddress?.address || 'No address'}`);
      console.log(`  📮 ${formattedAddress?.postcode || 'No postcode'}`);
    } else {
      results.push({
        id: company.id,
        name: company.name,
        category: company.category,
        error: 'Not found in Companies House'
      });
    }

    // Rate limit
    await sleep(DELAY_MS);
    console.log('');
  }

  // Save results
  const outputPath = path.join(__dirname, '..', 'data', 'companies_house_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Saved ${results.length} results to ${outputPath}`);

  // Summary
  const found = results.filter(r => !r.error).length;
  const notFound = results.filter(r => r.error).length;

  console.log(`\n📊 Summary:`);
  console.log(`   Found: ${found}`);
  console.log(`   Not found: ${notFound}`);
}

main().catch(console.error);
