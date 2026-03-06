#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read and parse CSV
const csvPath = path.join(__dirname, 'data/ecosystem.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

// Parse CSV rows
const rows = lines.slice(1).map(line => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = values[i] || '';
  });
  return obj;
});

// Helper to make geocoding requests
async function geocode(address, postcode, city = 'London', country = 'UK') {
  return new Promise((resolve, reject) => {
    // Build search query
    const parts = [];
    if (address && address !== 'London' && address.trim().length > 5) {
      parts.push(address);
    }
    if (postcode && postcode.trim().length > 0) {
      parts.push(postcode);
    }
    parts.push(city, country);

    const query = parts.join(', ');
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    https.get(url, {
      headers: {
        'User-Agent': 'LondonMaxxxingGeocodingScript/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lon: parseFloat(results[0].lon),
              display_name: results[0].display_name
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper to add delay (Nominatim rate limit: 1 req/sec)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// CSV escape helper
function csvEscape(str) {
  if (!str) return '';
  str = String(str);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Main processing
async function processGeocoding() {
  const FALLBACK_COORD = '51.5074,-0.1278';
  const geocoded = [];
  const staging = [];
  const newHeaders = [...headers, 'geocode_confidence'];

  console.log('Starting geocoding process...\n');
  console.log(`Total rows to process: ${rows.length}\n`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const hasAddress = row.address && row.address !== 'London' && row.address.trim().length > 10;
    const hasPostcode = row.postcode && row.postcode.trim().length > 0;
    const currentCoords = `${row.latitude},${row.longitude}`;
    const isFallback = currentCoords === FALLBACK_COORD;

    // Determine confidence and whether to keep existing coords or geocode
    if (hasAddress && hasPostcode && !isFallback) {
      // HIGH CONFIDENCE: Has full address + postcode + verified coordinates
      row.geocode_confidence = 'high';
      geocoded.push(row);
      console.log(`✓ [${i+1}/${rows.length}] ${row.id} - HIGH (keeping existing coords)`);
    } else if ((hasAddress || hasPostcode) && !isFallback) {
      // MEDIUM CONFIDENCE: Has partial address info with coordinates
      row.geocode_confidence = 'medium';
      geocoded.push(row);
      console.log(`✓ [${i+1}/${rows.length}] ${row.id} - MEDIUM (keeping existing coords)`);
    } else if (hasAddress || hasPostcode) {
      // Has address data but needs geocoding
      console.log(`⟳ [${i+1}/${rows.length}] ${row.id} - Geocoding...`);
      try {
        await delay(1100); // Respect rate limit
        const result = await geocode(row.address, row.postcode, row.city, row.country);

        if (result) {
          row.latitude = result.lat.toFixed(6);
          row.longitude = result.lon.toFixed(6);

          // Determine confidence based on what we had
          if (hasAddress && hasPostcode) {
            row.geocode_confidence = 'high';
          } else {
            row.geocode_confidence = 'medium';
          }

          geocoded.push(row);
          console.log(`  ✓ Geocoded to ${result.lat},${result.lon}`);
        } else {
          row.geocode_confidence = 'low';
          row.latitude = '';
          row.longitude = '';
          staging.push(row);
          console.log(`  ✗ No results - moved to staging`);
        }
      } catch (error) {
        console.log(`  ✗ Error: ${error.message} - moved to staging`);
        row.geocode_confidence = 'low';
        row.latitude = '';
        row.longitude = '';
        staging.push(row);
      }
    } else {
      // LOW CONFIDENCE: Only has "London" or no address
      row.geocode_confidence = 'low';
      row.latitude = '';
      row.longitude = '';
      staging.push(row);
      console.log(`✗ [${i+1}/${rows.length}] ${row.id} - LOW (needs better address) - staging`);
    }
  }

  // Write geocoded CSV (high + medium confidence only)
  const geocodedCsv = [
    newHeaders.join(','),
    ...geocoded.map(row =>
      newHeaders.map(h => csvEscape(row[h])).join(',')
    )
  ].join('\n');

  fs.writeFileSync(
    path.join(__dirname, 'data/ecosystem_geocoded.csv'),
    geocodedCsv
  );

  // Write staging CSV (low confidence - needs research)
  const stagingCsv = [
    newHeaders.join(','),
    ...staging.map(row =>
      newHeaders.map(h => csvEscape(row[h])).join(',')
    )
  ].join('\n');

  fs.writeFileSync(
    path.join(__dirname, 'data/ecosystem_staging.csv'),
    stagingCsv
  );

  // Count unique coordinates in geocoded file
  const uniqueCoords = new Set();
  geocoded.forEach(row => {
    if (row.latitude && row.longitude) {
      uniqueCoords.add(`${row.latitude},${row.longitude}`);
    }
  });

  // Final report
  console.log('\n=== FINAL REPORT ===');
  console.log(`Total companies processed: ${rows.length}`);
  console.log('');
  console.log('GEOCODED (ecosystem_geocoded.csv):');
  console.log(`  High confidence: ${geocoded.filter(r => r.geocode_confidence === 'high').length}`);
  console.log(`  Medium confidence: ${geocoded.filter(r => r.geocode_confidence === 'medium').length}`);
  console.log(`  Total: ${geocoded.length}`);
  console.log(`  Unique coordinates: ${uniqueCoords.size}`);
  console.log('');
  console.log('STAGING (ecosystem_staging.csv):');
  console.log(`  Low confidence: ${staging.length}`);
  console.log(`  (These need better addresses before geocoding)`);
  console.log('');
  console.log('Files written:');
  console.log('  - data/ecosystem_geocoded.csv');
  console.log('  - data/ecosystem_staging.csv');
}

// Run
processGeocoding().catch(console.error);
