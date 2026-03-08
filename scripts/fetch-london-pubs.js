// Fetch comprehensive London pubs data from Google Places API
// Usage: GOOGLE_MAPS_API_KEY=xxx node scripts/fetch-london-pubs.js

const fs = require('fs');

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error('Error: Set GOOGLE_MAPS_API_KEY environment variable');
  process.exit(1);
}

// Load dense auto-generated grid
const searchPoints = require('./search-grid.js');

/*
// Original manual search points (replaced by dense grid)
const manualSearchPoints = [
  // Central & City
  { lat: 51.5145, lng: -0.0906, name: 'City of London' },
  { lat: 51.5074, lng: -0.0977, name: 'Bank/Monument' },
  { lat: 51.5155, lng: -0.1076, name: 'Farringdon/Barbican' },
  { lat: 51.5194, lng: -0.1269, name: 'Bloomsbury' },
  { lat: 51.5074, lng: -0.1278, name: 'Trafalgar Square' },
  { lat: 51.5136, lng: -0.1361, name: 'Soho' },
  { lat: 51.5123, lng: -0.1200, name: 'Covent Garden' },
  { lat: 51.5152, lng: -0.1419, name: 'Fitzrovia' },
  { lat: 51.5175, lng: -0.1162, name: 'Holborn' },

  // East London
  { lat: 51.5186, lng: -0.0750, name: 'Spitalfields/Shoreditch' },
  { lat: 51.5251, lng: -0.0834, name: 'Hoxton' },
  { lat: 51.5309, lng: -0.0590, name: 'Hackney' },
  { lat: 51.5433, lng: -0.0553, name: 'Stoke Newington' },
  { lat: 51.5099, lng: -0.0813, name: 'Aldgate' },
  { lat: 51.5155, lng: -0.0550, name: 'Bethnal Green' },
  { lat: 51.5226, lng: -0.0437, name: 'Mile End' },
  { lat: 51.5099, lng: -0.0564, name: 'Wapping/Shadwell' },

  // West London
  { lat: 51.5186, lng: -0.1707, name: 'Marylebone' },
  { lat: 51.5152, lng: -0.1907, name: 'Paddington' },
  { lat: 51.5074, lng: -0.1950, name: 'Notting Hill' },
  { lat: 51.4927, lng: -0.1931, name: 'Kensington' },
  { lat: 51.4947, lng: -0.1773, name: 'South Kensington' },
  { lat: 51.4875, lng: -0.1687, name: 'Chelsea' },
  { lat: 51.5194, lng: -0.2078, name: 'Bayswater' },
  { lat: 51.5230, lng: -0.1547, name: 'Regent\'s Park' },

  // North London
  { lat: 51.5454, lng: -0.1427, name: 'Camden' },
  { lat: 51.5387, lng: -0.1434, name: 'Kentish Town' },
  { lat: 51.5656, lng: -0.1058, name: 'Highgate' },
  { lat: 51.5749, lng: -0.1463, name: 'Hampstead' },
  { lat: 51.5588, lng: -0.1410, name: 'Gospel Oak' },
  { lat: 51.5311, lng: -0.1042, name: 'King\'s Cross' },
  { lat: 51.5477, lng: -0.1053, name: 'Islington' },

  // South London
  { lat: 51.5007, lng: -0.1246, name: 'Waterloo/South Bank' },
  { lat: 51.5048, lng: -0.0863, name: 'Borough/London Bridge' },
  { lat: 51.4826, lng: -0.0929, name: 'Elephant & Castle' },
  { lat: 51.4624, lng: -0.1149, name: 'Camberwell' },
  { lat: 51.4995, lng: -0.1357, name: 'Lambeth' },
  { lat: 51.4716, lng: -0.1303, name: 'Brixton' },
  { lat: 51.4861, lng: -0.1696, name: 'Battersea' },
  { lat: 51.4706, lng: -0.1615, name: 'Clapham' },
  { lat: 51.4713, lng: -0.0632, name: 'Peckham' },
  { lat: 51.4826, lng: -0.0077, name: 'Greenwich' },
  { lat: 51.4578, lng: -0.0137, name: 'Lewisham' },

  // Additional coverage
  { lat: 51.5462, lng: -0.0586, name: 'Dalston' },
  { lat: 51.4995, lng: 0.0051, name: 'Canary Wharf' },
  { lat: 51.5074, lng: -0.0644, name: 'Whitechapel' },
  { lat: 51.5145, lng: -0.1598, name: 'Mayfair' },
  { lat: 51.5036, lng: -0.1458, name: 'Westminster' },
  { lat: 51.4875, lng: -0.1229, name: 'Kennington' },

  // More dense central coverage
  { lat: 51.5200, lng: -0.0900, name: 'Clerkenwell' },
  { lat: 51.5100, lng: -0.1100, name: 'Fleet Street' },
  { lat: 51.5120, lng: -0.0900, name: 'Cannon Street' },
  { lat: 51.5180, lng: -0.1500, name: 'Goodge Street' },
  { lat: 51.5100, lng: -0.1450, name: 'Piccadilly' },
  { lat: 51.5050, lng: -0.1150, name: 'Southwark' },
  { lat: 51.5250, lng: -0.1250, name: 'King\'s Cross/St Pancras' },
  { lat: 51.5350, lng: -0.1100, name: 'Angel' },

  // More east
  { lat: 51.5300, lng: -0.0300, name: 'Victoria Park' },
  { lat: 51.5400, lng: -0.0300, name: 'Hackney Wick' },
  { lat: 51.5150, lng: -0.0200, name: 'Bow' },
  { lat: 51.5050, lng: -0.0350, name: 'Stepney' },
  { lat: 51.5150, lng: -0.0050, name: 'Limehouse' },
  { lat: 51.5050, lng: 0.0200, name: 'Poplar' },

  // More west
  { lat: 51.5100, lng: -0.2200, name: 'Westbourne Park' },
  { lat: 51.5250, lng: -0.2200, name: 'Maida Vale' },
  { lat: 51.5350, lng: -0.1700, name: 'Primrose Hill' },
  { lat: 51.4900, lng: -0.2100, name: 'Holland Park' },

  // More south
  { lat: 51.4600, lng: -0.0900, name: 'Dulwich' },
  { lat: 51.4500, lng: -0.1400, name: 'Streatham' },
  { lat: 51.4550, lng: -0.1700, name: 'Tooting' },
  { lat: 51.4750, lng: -0.1900, name: 'Wandsworth' },
  { lat: 51.4650, lng: -0.1950, name: 'Balham' },
  { lat: 51.4400, lng: -0.0800, name: 'Catford' },
  { lat: 51.4550, lng: -0.0450, name: 'Blackheath' },

  // More north
  { lat: 51.5550, lng: -0.1650, name: 'Belsize Park' },
  { lat: 51.5650, lng: -0.1750, name: 'West Hampstead' },
  { lat: 51.5500, lng: -0.1800, name: 'Swiss Cottage' },
  { lat: 51.5700, lng: -0.1150, name: 'Highgate Village' },
  { lat: 51.5850, lng: -0.1350, name: 'East Finchley' },

  // Outer London - North (M25 ring)
  { lat: 51.6250, lng: -0.1350, name: 'Barnet' },
  { lat: 51.6500, lng: -0.2100, name: 'Edgware' },
  { lat: 51.6450, lng: -0.0800, name: 'Enfield' },
  { lat: 51.6200, lng: -0.0700, name: 'Southgate' },
  { lat: 51.6100, lng: -0.1100, name: 'Finchley' },
  { lat: 51.6350, lng: -0.2800, name: 'Stanmore' },
  { lat: 51.6000, lng: -0.2500, name: 'Hendon' },

  // Outer London - East (M25 ring)
  { lat: 51.5900, lng: -0.0100, name: 'Walthamstow' },
  { lat: 51.6350, lng: -0.0450, name: 'Chingford' },
  { lat: 51.5700, lng: 0.0100, name: 'Leyton' },
  { lat: 51.5600, lng: 0.0400, name: 'Leytonstone' },
  { lat: 51.5850, lng: 0.0650, name: 'Woodford' },
  { lat: 51.5650, lng: 0.1050, name: 'Redbridge' },
  { lat: 51.5400, lng: 0.0700, name: 'Stratford' },
  { lat: 51.5200, lng: 0.1250, name: 'East Ham' },
  { lat: 51.4900, lng: 0.0850, name: 'Woolwich' },
  { lat: 51.4500, lng: 0.0150, name: 'Eltham' },
  { lat: 51.4250, lng: 0.0100, name: 'Sidcup' },

  // Outer London - South (M25 ring)
  { lat: 51.3850, lng: -0.1050, name: 'Croydon' },
  { lat: 51.3500, lng: -0.1200, name: 'Purley' },
  { lat: 51.3800, lng: -0.0350, name: 'Bromley' },
  { lat: 51.4050, lng: -0.0150, name: 'Beckenham' },
  { lat: 51.4200, lng: -0.0700, name: 'Crystal Palace' },
  { lat: 51.4050, lng: -0.1400, name: 'Mitcham' },
  { lat: 51.3700, lng: -0.1600, name: 'Sutton' },
  { lat: 51.3550, lng: -0.2050, name: 'Epsom' },
  { lat: 51.4300, lng: -0.2100, name: 'Wimbledon' },
  { lat: 51.4150, lng: -0.2500, name: 'Morden' },
  { lat: 51.3900, lng: -0.2800, name: 'Kingston' },

  // Outer London - West (M25 ring)
  { lat: 51.4300, lng: -0.3400, name: 'Richmond' },
  { lat: 51.4650, lng: -0.3200, name: 'Twickenham' },
  { lat: 51.4900, lng: -0.3100, name: 'Hounslow' },
  { lat: 51.5100, lng: -0.3600, name: 'Brentford' },
  { lat: 51.5350, lng: -0.3800, name: 'Ealing' },
  { lat: 51.5550, lng: -0.3350, name: 'Acton' },
  { lat: 51.5200, lng: -0.4200, name: 'Greenford' },
  { lat: 51.5450, lng: -0.4600, name: 'Northolt' },
  { lat: 51.5700, lng: -0.4200, name: 'Wembley' },
  { lat: 51.5900, lng: -0.3500, name: 'Harrow' },
  { lat: 51.6100, lng: -0.2900, name: 'Harrow Weald' },

  // Northwest
  { lat: 51.5800, lng: -0.2200, name: 'Brent Cross' },
  { lat: 51.6200, lng: -0.2800, name: 'Mill Hill' },

  // Southwest
  { lat: 51.3800, lng: -0.3200, name: 'Surbiton' },
  { lat: 51.4100, lng: -0.3000, name: 'New Malden' },
];
*/

async function fetchPubsForPoint(point, radius = 1500) {
  console.log(`Fetching pubs near ${point.name}...`);

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.types'
        },
        body: JSON.stringify({
          includedTypes: ['bar'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: point.lat,
                longitude: point.lng
              },
              radius: radius
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!data.places) {
      console.log(`  No places found for ${point.name}`);
      return [];
    }

    const pubs = data.places
      .filter(place => {
        const types = place.types || [];
        const name = place.displayName?.text?.toLowerCase() || '';

        // Use Google's type classification - exclude lodging
        const hasLodgingType = types.some(t =>
          t === 'lodging' ||
          t === 'hotel' ||
          t === 'hostel' ||
          t === 'guest_house' ||
          t === 'motel'
        );

        if (hasLodgingType) {
          return false;
        }

        // Must be classified as a bar by Google
        const isBarType = types.includes('bar') || types.includes('night_club');

        // Or have pub/brewery/tavern in the name (Google doesn't have a "pub" type)
        const hasPubName = name.includes('pub') ||
                          name.includes('arms') ||
                          name.includes('tavern') ||
                          name.includes('brewery') ||
                          name.includes('ale house') ||
                          name.includes('alehouse');

        return isBarType || hasPubName;
      })
      .map(place => ({
        id: place.id || Math.random().toString(),
        name: place.displayName?.text || 'Unknown Pub',
        address: place.formattedAddress || '',
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        rating: place.rating || 0,
        reviews: place.userRatingCount || 0,
        mapsUrl: place.googleMapsUri || '',
        website: place.websiteUri || null
      }));

    console.log(`  Found ${pubs.length} pubs in ${point.name}`);
    return pubs;

  } catch (error) {
    console.error(`Error fetching ${point.name}:`, error.message);
    return [];
  }
}

async function fetchAllPubs() {
  const allPubs = [];
  const seenIds = new Set();

  // Fetch from each point with delay to avoid rate limits
  for (let i = 0; i < searchPoints.length; i++) {
    const pubs = await fetchPubsForPoint(searchPoints[i]);

    // Deduplicate by ID
    for (const pub of pubs) {
      if (!seenIds.has(pub.id)) {
        seenIds.add(pub.id);
        allPubs.push(pub);
      }
    }

    // Progress update
    console.log(`Progress: ${i + 1}/${searchPoints.length} areas searched, ${allPubs.length} unique pubs found\n`);

    // Delay to avoid rate limiting (adjust as needed)
    if (i < searchPoints.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return allPubs;
}

async function main() {
  console.log('🍺 Fetching London pubs from Google Places API...\n');
  console.log(`Searching ${searchPoints.length} locations across London\n`);

  const pubs = await fetchAllPubs();

  // Sort by rating and reviews
  pubs.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const output = {
    pubs,
    fetchedAt: new Date().toISOString(),
    totalPubs: pubs.length,
    searchPoints: searchPoints.length
  };

  fs.writeFileSync(
    'data/pubs.json',
    JSON.stringify(output, null, 2)
  );

  console.log('\n✅ Complete!');
  console.log(`📊 Total unique pubs: ${pubs.length}`);
  console.log(`💾 Saved to data/pubs.json`);

  console.log('\n🏆 Top 10 pubs by rating:');
  pubs.slice(0, 10).forEach((pub, i) => {
    console.log(`  ${i + 1}. ${pub.name} - ⭐ ${pub.rating} (${pub.reviews} reviews)`);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
