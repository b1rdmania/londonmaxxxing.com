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

async function main() {
  console.log('Reading ecosystem.csv...');
  const csv = fs.readFileSync('data/ecosystem.csv', 'utf8');
  const lines = csv.split('\n');
  const header = lines[0];
  const dataLines = lines.slice(1).filter(Boolean);

  console.log(`\nRe-geocoding ${dataLines.length} companies with full precision...\n`);

  const updated = [];
  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const parts = line.split(',');

    const id = parts[0];
    const name = parts[1];
    const address = parts[3]?.replace(/^"(.*)"$/, '$1');
    const postcode = parts[4];

    // Skip if no address
    if (!address || address === 'London' || !postcode) {
      updated.push(line);
      skipCount++;
      continue;
    }

    const query = `${address}, ${postcode}, London, UK`;

    if ((i + 1) % 20 === 0) {
      console.log(`Progress: ${i + 1}/${dataLines.length} (${Math.round((i + 1) / dataLines.length * 100)}%)`);
    }

    await sleep(DELAY_MS);

    try {
      const response = await geocodeAddress(query);

      if (response.status === 'OK' && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;

        // Update coordinates with full precision
        parts[10] = location.lat;
        parts[11] = location.lng;

        updated.push(parts.join(','));
        successCount++;
      } else {
        // Keep original if geocoding fails
        updated.push(line);
        console.log(`  ⚠️  Geocoding failed for ${name}: ${response.status}`);
      }
    } catch (error) {
      updated.push(line);
      console.log(`  ✗ Error geocoding ${name}: ${error.message}`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Successfully re-geocoded: ${successCount}`);
  console.log(`Skipped (no address): ${skipCount}`);
  console.log(`Failed: ${dataLines.length - successCount - skipCount}`);

  // Write updated CSV
  const newCsv = [header, ...updated].join('\n') + '\n';
  fs.writeFileSync('data/ecosystem.csv', newCsv);

  console.log(`\n✓ Updated data/ecosystem.csv with precision coordinates`);
}

main().catch(console.error);
