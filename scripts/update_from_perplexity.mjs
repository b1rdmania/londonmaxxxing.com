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

const nameToId = {
  'Crypto.com': 'cand-web3-002',
  'Bitpanda': 'cand-web3-004',
  'Blockdaemon': 'cand-web3-006',
  'QuickNode': 'cand-web3-008',
  'Transak': 'cand-web3-020',
  'Safe (Gnosis Safe)': 'cand-web3-021',
  'Tools for Humanity': 'cand-web3-022',
  'TRM Labs UK': 'cand-web3-024',
  'Soldo': 'cand-fintech-018',
  'Edumentors': 'cand-edu-006',
  'FutureLearn': 'cand-edu-011',
  'Kahoot UK': 'cand-edu-015',
  'Lindus Health': 'cand-tech-001',
  'GetHarley': 'cand-tech-002',
  'Cera': 'cand-tech-012',
  'Pactio': 'cand-tech-026',
  'NVIDIA UK': 'cand-tech-041',
  'IBM UK': 'cand-tech-046',
  'Cisco UK': 'cand-tech-048',
  'HubSpot UK': 'cand-tech-052',
  'Twilio UK': 'cand-tech-054',
  'Airbnb UK': 'cand-tech-056',
  'ByteDance UK': 'cand-tech-060'
};

async function main() {
  console.log('Reading Perplexity research...');
  const research = fs.readFileSync('data/perplexity_research.csv', 'utf8').split('\n');

  const updates = new Map();

  for (let i = 1; i < research.length; i++) {
    const line = research[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const [, name, address, postcode] = parts;

    const id = nameToId[name];
    if (!id) {
      console.log(`Skipping ${name} - no ID mapping`);
      continue;
    }

    const query = `${address}, ${postcode}, London, UK`;
    console.log(`\n[${i}] ${name}`);
    console.log(`  Geocoding: ${query}`);

    await sleep(DELAY_MS);
    const response = await geocodeAddress(query);

    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const location = result.geometry.location;
      console.log(`  ✓ Found: ${location.lat}, ${location.lng}`);

      updates.set(id, {
        address: address.replace(/"/g, ''),
        postcode,
        lat: location.lat,
        lng: location.lng
      });
    } else {
      console.log(`  ✗ Failed to geocode`);
    }
  }

  console.log(`\n\nUpdating ecosystem.csv...`);
  const ecosystemLines = fs.readFileSync('data/ecosystem.csv', 'utf8').split('\n');
  const header = ecosystemLines[0];
  const updated = [header];

  let updatedCount = 0;

  for (let i = 1; i < ecosystemLines.length; i++) {
    const line = ecosystemLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const id = parts[0];

    if (updates.has(id)) {
      const update = updates.get(id);
      parts[3] = `"${update.address}"`;
      parts[4] = update.postcode;
      parts[10] = update.lat;
      parts[11] = update.lng;
      updatedCount++;
      console.log(`  Updated ${id}`);
    }

    updated.push(parts.join(','));
  }

  fs.writeFileSync('data/ecosystem.csv', updated.join('\n') + '\n');
  console.log(`\n✓ Updated ${updatedCount} companies in ecosystem.csv`);
}

main().catch(console.error);
