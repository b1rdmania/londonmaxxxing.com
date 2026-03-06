#!/usr/bin/env node
import fs from 'fs';
import https from 'https';

const API_KEY = 'AIzaSyCHelyxHT6goBqx2mkhnhq9MdTUlAmczTY';
const DELAY_MS = 200;
const FALLBACK_LAT = '51.5074';
const FALLBACK_LNG = '-0.1278';

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
          resolve(JSON.parse(data));
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
  const lines = fs.readFileSync('data/ecosystem.csv', 'utf8').split('\n');
  const header = lines[0];
  const updated = [header];

  let geocoded = 0;
  let failed = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const [id, name, category, address, postcode, city, country, website, sourceUrl, notes, lat, lng, twitter] = parts;

    // Check if this row has the fallback coordinate
    if (lat === FALLBACK_LAT && lng === FALLBACK_LNG) {
      console.log(`\n[${geocoded + failed + 1}] ${name}`);

      const query = `${name} Office London`;
      console.log(`  Searching: ${query}`);

      await sleep(DELAY_MS);
      const response = await geocodeAddress(query);

      if (response.status === 'OK' && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        const addressComponents = result.address_components;

        // Extract postcode
        let newPostcode = postcode;
        for (const component of addressComponents) {
          if (component.types.includes('postal_code')) {
            newPostcode = component.long_name;
            break;
          }
        }

        // Check if result is in London
        const isLondon = addressComponents.some(c =>
          c.types.includes('postal_town') && c.long_name === 'London'
        );

        if (isLondon && newPostcode) {
          const newAddress = result.formatted_address.split(',')[0].replace(/"/g, '');
          console.log(`  ✓ Found: ${newAddress}, ${newPostcode}`);
          console.log(`    Coords: ${location.lat}, ${location.lng}`);

          parts[3] = `"${newAddress}"`;
          parts[4] = newPostcode;
          parts[10] = location.lat;
          parts[11] = location.lng;
          geocoded++;
        } else {
          console.log(`  ✗ Not in London or no postcode`);
          failed++;
        }
      } else {
        console.log(`  ✗ Not found (${response.status})`);
        failed++;
      }
    }

    updated.push(parts.join(','));
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Geocoded: ${geocoded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${geocoded + failed}`);

  fs.writeFileSync('data/ecosystem.csv', updated.join('\n') + '\n');
  console.log(`\nUpdated data/ecosystem.csv`);
}

main().catch(console.error);
