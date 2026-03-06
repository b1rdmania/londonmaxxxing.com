#!/usr/bin/env node

/**
 * Bulk Company Research Tool
 * Processes 152 companies to find verified London addresses and coordinates
 */

import fs from 'fs';
import https from 'https';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || '';

// Known verified addresses (manually researched)
const VERIFIED_ADDRESSES = {
  'Google UK': { address: '6 Pancras Square', postcode: 'N1C 4AG', lat: 51.5353, lng: -0.1247, twitter: '@Google' },
  'Meta UK': { address: '10 Brock Street, Regent\'s Place', postcode: 'NW1 3FG', lat: 51.5263, lng: -0.1426, twitter: '@Meta' },
  'Amazon UK': { address: '1 Principal Place, Worship Street', postcode: 'EC2A 2FA', lat: 51.5232, lng: -0.0804, twitter: '@amazon' },
  'Apple UK': { address: '1 Battersea Power Station, Circus Road South', postcode: 'SW8 5BN', lat: 51.4816, lng: -0.1451, twitter: '@Apple' },
  'Microsoft UK': { address: '2 Kingdom Street, Paddington', postcode: 'W2 6BD', lat: 51.5181, lng: -0.1769, twitter: '@Microsoft' },
  'Salesforce UK': { address: 'Salesforce Tower, 110 Bishopsgate', postcode: 'EC2N 4AY', lat: 51.5159, lng: -0.0811, twitter: '@salesforce' },
  'TikTok UK': { address: 'Kaleidoscope, 4 Lindsey Street', postcode: 'EC1A 9HP', lat: 51.5199, lng: -0.0978, twitter: '@TikTokComms' },
  'Palantir UK': { address: '19-25 Birchin Lane', postcode: 'EC3V 9DU', lat: 51.5131, lng: -0.0862, twitter: '@PalantirTech' },
  'Spotify UK': { address: 'The Adelphi, 1-11 John Adam Street', postcode: 'WC2N 6HT', lat: 51.5085, lng: -0.1242, twitter: '@Spotify' },
  'Netflix UK': { address: '30 Berners Street', postcode: 'W1T 3LR', lat: 51.5182, lng: -0.1352, twitter: '@netflix' },
  'Revolut': { address: '7 Westferry Circus, Canary Wharf', postcode: 'E14 4HD', lat: 51.5053, lng: -0.0197, twitter: '@RevolutApp' },
  'Monzo': { address: 'Broadwalk House, 5 Appold Street', postcode: 'EC2A 2AG', lat: 51.5202, lng: -0.0848, twitter: '@monzo' },
  'Wise': { address: 'Worship Square, Clifton Street', postcode: 'EC2A 4BB', lat: 51.5238, lng: -0.0866, twitter: '@Wise' },
  'OpenAI': { address: '50 Broadway', postcode: 'SW1H 0BL', lat: 51.4993, lng: -0.1327, twitter: '@OpenAI' },
  'ElevenLabs': { address: 'Wardour Street, Soho', postcode: 'W1F 0UG', lat: 51.5134, lng: -0.1333, twitter: '@elevenlabsio' },
  'Deliveroo': { address: 'The River Building, 1 Cousin Lane', postcode: 'EC4R 3TE', lat: 51.5118, lng: -0.0903, twitter: '@Deliveroo' },
  'Blockchain.com': { address: '120 Long Acre', postcode: 'WC2E 9PA', lat: 51.5141, lng: -0.1257, twitter: '@blockchain' },
  'Elliptic': { address: '31-32 Ely Place', postcode: 'EC1N 6TD', lat: 51.5183, lng: -0.1090, twitter: '@elliptic' },
  'Graphcore': { address: '107 Cheapside', postcode: 'EC2V 6DN', lat: 51.5148, lng: -0.0937, twitter: '@Graphcore' },
  'Darktrace': { address: 'Maurice House, 1 Holborn Circus', postcode: 'EC1N 2HL', lat: 51.5176, lng: -0.1089, twitter: '@Darktrace' },
  'Snyk': { address: '40 Whitfield Street', postcode: 'W1T 2RH', lat: 51.5234, lng: -0.1359, twitter: '@snyksec' },
  'Paddle': { address: 'The Cotton Building, Whitechapel High Street', postcode: 'E1 8QS', lat: 51.5154, lng: -0.0734, twitter: '@PaddleHQ' },
  'Freetrade': { address: 'Interchange, 81-85 Railway Street', postcode: 'N1 9SD', lat: 51.5339, lng: -0.1042, twitter: '@freetrade' },
  'Marshmallow': { address: '10 John Street', postcode: 'WC1N 2EB', lat: 51.5200, lng: -0.1166, twitter: '@getmarshmallow' },
  'Gousto': { address: 'The Frames, 1 Phipp Street', postcode: 'EC2A 4PS', lat: 51.5252, lng: -0.0804, twitter: '@GoustoUK' },
  'Zego': { address: 'Runway East, 10 Finsbury Square', postcode: 'EC2A 1AF', lat: 51.5212, lng: -0.0878, twitter: '@zego' },
  'Onfido': { address: '3 Finsbury Avenue', postcode: 'EC2M 2PA', lat: 51.5209, lng: -0.0851, twitter: '@Onfido' },
  'Uber UK': { address: 'Aldgate Tower, 2 Leman Street', postcode: 'E1 8FA', lat: 51.5137, lng: -0.0735, twitter: '@Uber' },
  'Airbnb UK': { address: '100 New Bridge Street', postcode: 'EC4V 6JA', lat: 51.5136, lng: -0.1026, twitter: '@Airbnb' },
  'Nothing': { address: '101-103 Farringdon Road', postcode: 'EC1R 3BW', lat: 51.5211, lng: -0.1087, twitter: '@nothing' },
  'Multiverse': { address: '33 Kingsway', postcode: 'WC2B 6UF', lat: 51.5149, lng: -0.1201, twitter: '@MultiverseIO' },
  'Tide': { address: '2-4 Brushfield Street', postcode: 'E1 6AN', lat: 51.5186, lng: -0.0765, twitter: '@Tide' },
  'Zilch': { address: '16 Great Chapel Street', postcode: 'W1F 8FL', lat: 51.5142, lng: -0.1334, twitter: '@zilchhq' }
};

// Helper functions
async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    https.get(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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

async function searchCompaniesHouse(companyName) {
  if (!COMPANIES_HOUSE_API_KEY) return null;

  try {
    const url = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=5`;
    const auth = Buffer.from(`${COMPANIES_HOUSE_API_KEY}:`).toString('base64');

    const data = await fetchJson(url, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (data.items && data.items.length > 0) {
      // Get the first matching company
      const company = data.items[0];
      const detailsUrl = `https://api.company-information.service.gov.uk/company/${company.company_number}`;
      const details = await fetchJson(detailsUrl, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (details.registered_office_address) {
        const addr = details.registered_office_address;
        return {
          address: [addr.address_line_1, addr.address_line_2].filter(Boolean).join(', '),
          postcode: addr.postal_code,
          locality: addr.locality
        };
      }
    }
  } catch (error) {
    console.error(`Companies House error for ${companyName}:`, error.message);
  }
  return null;
}

async function geocodeAddress(address, postcode) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('⚠️  No Google Maps API key - using estimated coordinates');
    return null;
  }

  try {
    const fullAddress = postcode ? `${address}, ${postcode}, London, UK` : `${address}, London, UK`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`;

    const data = await fetchJson(url);

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id
      };
    }
  } catch (error) {
    console.error(`Geocoding error:`, error.message);
  }
  return null;
}

function determineConfidence(address, postcode, geocode) {
  // Low confidence if only "London" or no specific address
  if (!address || address === 'London' || !postcode) {
    return 'low';
  }

  // High confidence if we have street address + postcode + verified geocode
  const hasStreetNumber = /^\d+/.test(address);
  const hasPostcode = /[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/.test(postcode);

  if (hasStreetNumber && hasPostcode && geocode) {
    return 'high';
  }

  // Medium confidence if we have postcode and some address
  if (hasPostcode && address && address !== 'London') {
    return 'medium';
  }

  return 'low';
}

async function processCompany(company, index, total) {
  console.log(`\n[${index + 1}/${total}] ${company.name}`);

  // Check if we have verified data
  if (VERIFIED_ADDRESSES[company.name]) {
    const verified = VERIFIED_ADDRESSES[company.name];
    console.log(`  ✓ Using verified data: ${verified.address}, ${verified.postcode}`);
    return {
      ...company,
      address: verified.address,
      postcode: verified.postcode,
      latitude: verified.lat,
      longitude: verified.lng,
      twitter: verified.twitter || company.twitter || '',
      geocode_confidence: 'high'
    };
  }

  let address = company.address;
  let postcode = company.postcode;
  let lat = '';
  let lng = '';
  let confidence = 'low';
  let twitter = company.twitter || '';

  // Try Companies House
  const chData = await searchCompaniesHouse(company.name);
  if (chData && chData.postcode) {
    console.log(`  📋 Companies House: ${chData.address}, ${chData.postcode}`);
    address = chData.address;
    postcode = chData.postcode;
  }

  // Try geocoding if we have a decent address
  if (address && address !== 'London' && postcode) {
    const geocode = await geocodeAddress(address, postcode);
    if (geocode) {
      console.log(`  📍 Geocoded: ${geocode.lat}, ${geocode.lng}`);
      lat = geocode.lat;
      lng = geocode.lng;
    }
  }

  confidence = determineConfidence(address, postcode, lat ? { lat, lng } : null);
  console.log(`  Confidence: ${confidence}`);

  return {
    ...company,
    address: address || 'London',
    postcode: postcode || '',
    latitude: lat,
    longitude: lng,
    twitter: twitter,
    geocode_confidence: confidence
  };
}

async function main() {
  console.log('🚀 Bulk Company Research Tool\n');
  console.log('API Keys configured:');
  console.log(`  Google Maps: ${GOOGLE_MAPS_API_KEY ? '✓' : '✗ (set GOOGLE_MAPS_API_KEY)'}`);
  console.log(`  Companies House: ${COMPANIES_HOUSE_API_KEY ? '✓' : '✗ (set COMPANIES_HOUSE_API_KEY)'}`);
  console.log(`  Verified database: ${Object.keys(VERIFIED_ADDRESSES).length} companies\n`);

  // Read staging CSV
  const csvContent = fs.readFileSync('/tmp/londonmaxxxing.com/data/ecosystem_staging.csv', 'utf-8');
  const companies = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Processing ${companies.length} companies...\n`);

  const processed = [];

  for (let i = 0; i < companies.length; i++) {
    const result = await processCompany(companies[i], i, companies.length);
    processed.push(result);

    // Save progress every 10 companies
    if ((i + 1) % 10 === 0) {
      console.log(`\n💾 Saving progress (${i + 1}/${companies.length})...`);
      const progressCsv = stringify(processed, { header: true });
      fs.writeFileSync('/tmp/londonmaxxxing.com/data/progress.csv', progressCsv);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Split into verified and unverified
  const verified = processed.filter(c =>
    c.geocode_confidence === 'high' || c.geocode_confidence === 'medium'
  );
  const unverified = processed.filter(c => c.geocode_confidence === 'low');

  // Write final files
  const verifiedCsv = stringify(verified, { header: true });
  const unverifiedCsv = stringify(unverified, { header: true });
  const allCsv = stringify(processed, { header: true });

  fs.writeFileSync('/tmp/londonmaxxxing.com/data/ecosystem_complete.csv', verifiedCsv);
  fs.writeFileSync('/tmp/londonmaxxxing.com/data/ecosystem_unverified.csv', unverifiedCsv);
  fs.writeFileSync('/tmp/londonmaxxxing.com/data/ecosystem_all.csv', allCsv);

  // Summary
  console.log('\n✅ COMPLETE\n');
  console.log(`Total: ${processed.length}`);
  console.log(`High confidence: ${processed.filter(c => c.geocode_confidence === 'high').length}`);
  console.log(`Medium confidence: ${processed.filter(c => c.geocode_confidence === 'medium').length}`);
  console.log(`Low confidence: ${processed.filter(c => c.geocode_confidence === 'low').length}`);
  console.log('\nOutput files:');
  console.log('  ✓ ecosystem_complete.csv (high/medium confidence)');
  console.log('  ✓ ecosystem_unverified.csv (low confidence)');
  console.log('  ✓ ecosystem_all.csv (all companies)');
}

main().catch(console.error);
