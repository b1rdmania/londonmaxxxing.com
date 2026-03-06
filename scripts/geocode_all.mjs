#!/usr/bin/env node
import fs from 'fs';
import https from 'https';

const API_KEY = 'AIzaSyCHelyxHT6goBqx2mkhnhq9MdTUlAmczTY';
const DELAY_MS = 200; // Rate limit: 5 requests per second

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

function parseCSVLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

async function main() {
  console.log('Reading unverified companies...');
  const unverified = fs.readFileSync('data/ecosystem_unverified.csv', 'utf8').split('\n');
  const header = unverified[0];

  const results = [];
  const notFound = [];

  for (let i = 1; i < unverified.length; i++) {
    const line = unverified[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const [id, name, category, , , , , website] = parts;

    console.log(`\n[${i}/${unverified.length - 1}] ${name}`);

    // Try company name + "London office"
    const query = `${name} London office UK`;
    console.log(`  Searching: ${query}`);

    await sleep(DELAY_MS);
    const response = await geocodeAddress(query);

    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components;

      // Extract postcode
      let postcode = '';
      for (const component of addressComponents) {
        if (component.types.includes('postal_code')) {
          postcode = component.long_name;
          break;
        }
      }

      // Check if result is actually in London
      const isLondon = addressComponents.some(c =>
        c.types.includes('postal_town') && c.long_name === 'London'
      );

      if (isLondon && postcode) {
        const address = result.formatted_address.split(',')[0]; // First line only
        console.log(`  ✓ Found: ${address}, ${postcode}`);
        console.log(`    Coords: ${location.lat}, ${location.lng}`);

        results.push({
          id,
          name,
          category,
          address: address.replace(/"/g, ''),
          postcode,
          city: 'London',
          country: 'UK',
          website,
          source_url: '',
          notes: parts[9] || '',
          latitude: location.lat,
          longitude: location.lng,
          twitter: '',
          geocode_confidence: 'high'
        });
      } else {
        console.log(`  ✗ Not in London or no postcode`);
        notFound.push(line);
      }
    } else {
      console.log(`  ✗ Not found (${response.status})`);
      notFound.push(line);
    }
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Found: ${results.length}`);
  console.log(`Not found: ${notFound.length}`);

  // Write results
  const csvLines = [header];
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
    csvLines.push(line);
  }

  fs.writeFileSync('data/ecosystem_researched.csv', csvLines.join('\n') + '\n');
  console.log(`\nWrote ${results.length} companies to data/ecosystem_researched.csv`);

  if (notFound.length > 0) {
    fs.writeFileSync('data/ecosystem_still_unverified.csv', [header, ...notFound].join('\n') + '\n');
    console.log(`Wrote ${notFound.length} unverified to data/ecosystem_still_unverified.csv`);
  }
}

main().catch(console.error);
