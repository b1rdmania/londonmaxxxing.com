#!/usr/bin/env node
import fs from 'fs';
import https from 'https';

const API_KEY = 'AIzaSyCHelyxHT6goBqx2mkhnhq9MdTUlAmczTY';
const DELAY_MS = 200;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function geocodeAddress(query) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const companies = [
  {
    name: 'Prima Mente',
    address: 'Third Floor, 20 Old Bailey, London',
    postcode: 'EC4M 7AN',
    twitter: '@PrimaMente',
    notes: 'Epigenetics and neurodegenerative disease AI diagnostics (Alzheimer\'s/Parkinson\'s). Building biological foundation models for the brain.',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/13671760'
  },
  {
    name: 'Charm Therapeutics',
    address: 'The Stanley Building, 7 Pancras Square, London',
    postcode: 'N1C 4AG',
    twitter: '@CHARMTherapeutx',
    notes: 'AI-powered small molecule drug discovery using 3D deep learning (DragonFold technology) for protein-ligand interactions',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/13641471'
  },
  {
    name: 'Valence Discovery',
    address: '3 Pancras Square, King\'s Cross, London',
    postcode: 'N1C 4AG',
    twitter: '@valence_ai',
    notes: 'AI-enabled drug design (acquired by Recursion in May 2023). Now part of Valence Labs - Recursion\'s AI research engine',
    source_url: 'https://www.globenewswire.com/news-release/2024/03/11/2843488/0/en/Recursion-Announces-Plans-to-Open-New-Office-in-London.html'
  },
  {
    name: 'Recursion Pharmaceuticals',
    address: '3 Pancras Square, King\'s Cross, London',
    postcode: 'N1C 4AG',
    twitter: '@RecursionPharma',
    notes: 'AI-powered drug discovery platform combining biology, chemistry and technology. London office opened June 2024 (6700 sq ft)',
    source_url: 'https://ir.recursion.com/news-releases/news-release-details/recursion-announces-plans-open-new-office-london'
  },
  {
    name: 'Hologen',
    address: '86-87 Campden Street, London',
    postcode: 'W8 7EN',
    twitter: '',
    notes: 'Frontier medical AI company focused on drug development, diagnostics and investment. Spun out from UCL and King\'s College London. Co-founded by Eric Schmidt',
    source_url: 'https://find-and-update.company-information.service.gov.uk/company/14666561'
  }
];

async function main() {
  console.log('Geocoding 5 AI x Bio companies...\n');

  const results = [];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const query = `${company.address}, ${company.postcode}, UK`;

    console.log(`[${i+1}/5] ${company.name}`);
    console.log(`  Geocoding: ${query}`);

    await sleep(DELAY_MS);
    const response = await geocodeAddress(query);

    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const location = result.geometry.location;

      console.log(`  ✓ Found: ${location.lat}, ${location.lng}\n`);

      results.push({
        id: `ai_bio-${String(i + 1).padStart(3, '0')}`,
        name: company.name,
        category: 'ai_bio',
        address: company.address,
        postcode: company.postcode,
        city: 'London',
        country: 'UK',
        website: '',
        source_url: company.source_url,
        notes: company.notes,
        latitude: location.lat,
        longitude: location.lng,
        twitter: company.twitter,
        geocode_confidence: 'high'
      });
    } else {
      console.log(`  ✗ Geocoding failed (${response.status})\n`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Successfully geocoded: ${results.length}/5`);

  if (results.length > 0) {
    // Read existing ecosystem.csv
    const ecosystemCsv = fs.readFileSync('data/ecosystem.csv', 'utf8');
    const lines = ecosystemCsv.trim().split('\n');
    const header = lines[0];

    // Append new companies
    for (const row of results) {
      const line = [
        row.id,
        row.name,
        row.category,
        `"${row.address}"`,
        row.postcode,
        row.city,
        row.country,
        row.website,
        row.source_url,
        row.notes,
        row.latitude,
        row.longitude,
        row.twitter,
        row.geocode_confidence
      ].join(',');
      lines.push(line);
    }

    fs.writeFileSync('data/ecosystem.csv', lines.join('\n') + '\n');
    console.log(`\nAdded ${results.length} AI x Bio companies to data/ecosystem.csv`);
    console.log(`Total companies: ${lines.length - 1}`);
  }
}

main().catch(console.error);
