#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// Google Maps Geocoding API key (needs to be set)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Helper to fetch URL content
async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ...options.headers
      }
    };

    https.get(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Search Companies House for registered address
async function searchCompaniesHouse(companyName) {
  try {
    // Companies House API requires API key - skip for now, will do manual lookup
    return null;
  } catch (error) {
    return null;
  }
}

// Extract address from company website
async function extractAddressFromWebsite(websiteUrl) {
  if (!websiteUrl || websiteUrl.includes('wikipedia.org') || websiteUrl.includes('wired.com')) {
    return null;
  }

  try {
    const html = await fetchUrl(websiteUrl);

    // Look for common address patterns
    const addressPatterns = [
      /(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Street|Road|Avenue|Lane|Way|Square|Place|Court|Gardens|Terrace|Drive|Close|Walk|Mews))?),?\s*London,?\s*([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})?/gi,
      /London[,\s]+([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})/gi,
      /(\d+\s+[^<>,\n]+),\s*London/gi
    ];

    for (const pattern of addressPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
    }

    // Look for postcode patterns
    const postcodePattern = /([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})/g;
    const postcodes = html.match(postcodePattern);
    if (postcodes && postcodes.length > 0) {
      return `London ${postcodes[0]}`;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Geocode address using Google Maps API
async function geocodeAddress(address) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('No Google Maps API key set, skipping geocoding');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetchUrl(url);
    const data = JSON.parse(response);

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        types: result.types
      };
    }

    return null;
  } catch (error) {
    console.error(`Geocoding error for ${address}:`, error.message);
    return null;
  }
}

// Extract Twitter handle from website
async function extractTwitterHandle(websiteUrl) {
  if (!websiteUrl || websiteUrl.includes('wikipedia.org') || websiteUrl.includes('wired.com')) {
    return '';
  }

  try {
    const html = await fetchUrl(websiteUrl);

    // Look for Twitter links
    const twitterPatterns = [
      /twitter\.com\/([a-zA-Z0-9_]+)/i,
      /x\.com\/([a-zA-Z0-9_]+)/i
    ];

    for (const pattern of twitterPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && !match[1].includes('intent') && !match[1].includes('share')) {
        return '@' + match[1];
      }
    }

    return '';
  } catch (error) {
    return '';
  }
}

// Determine geocode confidence
function determineConfidence(address, geocodeResult) {
  if (!address || address === 'London' || !geocodeResult) {
    return 'low';
  }

  const hasStreetAddress = /\d+\s+[A-Z][a-z]+/.test(address);
  const hasPostcode = /[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/.test(address);

  // Check if geocode result is specific (not just "London")
  const isSpecific = geocodeResult.types &&
    (geocodeResult.types.includes('street_address') ||
     geocodeResult.types.includes('premise') ||
     geocodeResult.types.includes('establishment'));

  if (hasStreetAddress && hasPostcode && isSpecific) {
    return 'high';
  } else if ((hasStreetAddress || hasPostcode) && geocodeResult) {
    return 'medium';
  }

  return 'low';
}

// Process a single company
async function processCompany(company, index, total) {
  console.log(`\n[${index + 1}/${total}] Processing ${company.name}...`);

  let address = company.address;
  let postcode = company.postcode || '';
  let twitter = company.twitter || '';
  let geocodeResult = null;
  let confidence = 'low';

  // Try to extract address from website
  if (company.website) {
    console.log(`  Checking website: ${company.website}`);
    const extractedAddress = await extractAddressFromWebsite(company.website);
    if (extractedAddress && extractedAddress !== 'London') {
      console.log(`  Found address: ${extractedAddress}`);
      address = extractedAddress;

      // Extract postcode if present
      const postcodeMatch = address.match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/);
      if (postcodeMatch) {
        postcode = postcodeMatch[0];
      }
    }

    // Extract Twitter handle
    if (!twitter) {
      const extractedTwitter = await extractTwitterHandle(company.website);
      if (extractedTwitter) {
        console.log(`  Found Twitter: ${extractedTwitter}`);
        twitter = extractedTwitter;
      }
    }
  }

  // Attempt geocoding if we have a meaningful address
  if (address && address !== 'London') {
    console.log(`  Geocoding: ${address}`);
    geocodeResult = await geocodeAddress(address);

    if (geocodeResult) {
      console.log(`  Coordinates: ${geocodeResult.lat}, ${geocodeResult.lng}`);
      confidence = determineConfidence(address, geocodeResult);
      console.log(`  Confidence: ${confidence}`);
    }
  }

  return {
    ...company,
    address: address || 'London',
    postcode: postcode,
    twitter: twitter,
    latitude: geocodeResult ? geocodeResult.lat : '',
    longitude: geocodeResult ? geocodeResult.lng : '',
    geocode_confidence: confidence
  };
}

// Main function
async function main() {
  console.log('Starting company research automation...\n');

  // Read staging CSV
  const csvContent = fs.readFileSync('/tmp/londonmaxxxing.com/data/ecosystem_staging.csv', 'utf-8');
  const companies = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Loaded ${companies.length} companies from staging CSV`);

  const processedCompanies = [];

  // Process each company
  for (let i = 0; i < companies.length; i++) {
    const processed = await processCompany(companies[i], i, companies.length);
    processedCompanies.push(processed);

    // Rate limiting: wait 1 second between requests
    if (i < companies.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Split into verified and unverified
  const verified = processedCompanies.filter(c =>
    c.geocode_confidence === 'high' || c.geocode_confidence === 'medium'
  );

  const unverified = processedCompanies.filter(c =>
    c.geocode_confidence === 'low'
  );

  // Write output files
  const verifiedCsv = stringify(verified, { header: true });
  const unverifiedCsv = stringify(unverified, { header: true });

  fs.writeFileSync('/tmp/londonmaxxxing.com/data/ecosystem_complete.csv', verifiedCsv);
  fs.writeFileSync('/tmp/londonmaxxxing.com/data/ecosystem_unverified.csv', unverifiedCsv);

  console.log('\n=== PROCESSING COMPLETE ===');
  console.log(`Total companies: ${processedCompanies.length}`);
  console.log(`Verified (high/medium confidence): ${verified.length}`);
  console.log(`Unverified (low confidence): ${unverified.length}`);
  console.log('\nOutput files:');
  console.log('  - /tmp/londonmaxxxing.com/data/ecosystem_complete.csv');
  console.log('  - /tmp/londonmaxxxing.com/data/ecosystem_unverified.csv');
}

main().catch(console.error);
