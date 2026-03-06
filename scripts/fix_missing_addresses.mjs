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

const updates = [
  { id: 'cand-tech-007', name: 'Snyk', address: 'Suite 4, 7th Floor, 50 Broadway', postcode: 'SW1H 0DB', source: 'https://find-and-update.company-information.service.gov.uk/company/09677925' },
  { id: 'cand-tech-011', name: 'Lendable', address: 'Telephone House, 69-77 Paul Street', postcode: 'EC2A 4NW', source: 'https://find-and-update.company-information.service.gov.uk/company/08828186' },
  { id: 'cand-tech-013', name: 'Quantum Motion', address: '9 Sterling Way', postcode: 'N7 9HJ', source: 'https://find-and-update.company-information.service.gov.uk/company/10867089' },
  { id: 'cand-tech-016', name: 'Nothing', address: 'Bedford House, 21a John Street', postcode: 'WC1N 2BF', source: 'https://find-and-update.company-information.service.gov.uk/company/12984564' },
  { id: 'cand-tech-017', name: 'Onfido', address: '9 Devonshire Square, 4th Floor', postcode: 'EC2M 4YF', source: 'https://find-and-update.company-information.service.gov.uk/company/07479524' },
  { id: 'cand-tech-023', name: 'Laka', address: 'Runway East Borough Market, 20 St Thomas St', postcode: 'SE1 9RS', source: 'https://find-and-update.company-information.service.gov.uk/company/10575209' },
  { id: 'cand-tech-029', name: 'Hived', address: '1a Old Nichol Street', postcode: 'E2 7HR', source: 'https://find-and-update.company-information.service.gov.uk/company/13493813' },
  { id: 'cand-tech-032', name: 'Google UK', address: '6 Pancras Square', postcode: 'N1C 4AG', source: 'https://www.kingscross.co.uk/google' },
  { id: 'cand-tech-033', name: 'Microsoft UK', address: '2 Kingdom Street', postcode: 'W2 6BD', source: 'https://www.microsoft.com/en-gb/about/offices/paddington/' },
  { id: 'cand-tech-035', name: 'Meta UK', address: '10 Brock Street, Regent\'s Place', postcode: 'NW1 3FG', source: 'https://find-and-update.company-information.service.gov.uk/company/13792358' },
  { id: 'cand-tech-036', name: 'Apple UK', address: '280 Bishopsgate', postcode: 'EC2M 4AG', source: 'https://find-and-update.company-information.service.gov.uk/company/05051046' },
  { id: 'cand-tech-037', name: 'TikTok UK', address: 'Kaleidoscope, 4 Lindsey Street', postcode: 'EC1A 9HP', source: 'https://find-and-update.company-information.service.gov.uk/company/10165711' },
  { id: 'cand-tech-044', name: 'Palantir UK', address: 'Birchin Court 5th Floor, 19-25 Birchin Lane', postcode: 'EC3V 9DU', source: 'https://find-and-update.company-information.service.gov.uk/company/07042994' },
  { id: 'cand-tech-057', name: 'Uber UK', address: 'Floors 13-15, Aldgate Tower, 2 Leman Street', postcode: 'E1 8FA', source: 'https://find-and-update.company-information.service.gov.uk/company/08014782' }
];

async function main() {
  console.log(`Geocoding ${updates.length} companies with verified addresses...\n`);

  const results = [];

  for (let i = 0; i < updates.length; i++) {
    const company = updates[i];
    const query = `${company.address}, ${company.postcode}, London, UK`;

    console.log(`[${i+1}/${updates.length}] ${company.name}`);
    console.log(`  Geocoding: ${query}`);

    await sleep(DELAY_MS);
    const response = await geocodeAddress(query);

    if (response.status === 'OK' && response.results.length > 0) {
      const result = response.results[0];
      const location = result.geometry.location;

      console.log(`  ✓ Found: ${location.lat}, ${location.lng}\n`);

      results.push({
        id: company.id,
        name: company.name,
        address: company.address,
        postcode: company.postcode,
        source: company.source,
        latitude: location.lat,
        longitude: location.lng
      });
    } else {
      console.log(`  ✗ Geocoding failed (${response.status})\n`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Successfully geocoded: ${results.length}/${updates.length}`);

  if (results.length > 0) {
    // Read existing CSV
    const csv = fs.readFileSync('data/ecosystem.csv', 'utf8');
    const lines = csv.split('\n');

    // Update matching lines
    const updated = lines.map(line => {
      if (!line || line.startsWith('id,')) return line;

      const parts = line.split(',');
      const id = parts[0];

      const match = results.find(r => r.id === id);
      if (match) {
        parts[3] = match.address;
        parts[4] = match.postcode;
        parts[8] = match.source;
        parts[10] = match.latitude;
        parts[11] = match.longitude;
        return parts.join(',');
      }

      return line;
    });

    fs.writeFileSync('data/ecosystem.csv', updated.join('\n'));
    console.log(`\nUpdated ${results.length} companies in data/ecosystem.csv`);
  }
}

main().catch(console.error);
