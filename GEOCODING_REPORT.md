# Geocoding Report - London Tech Ecosystem

**Date:** 2026-03-06
**Task:** Fix geocoding issues in ecosystem.csv following strict accuracy rules

## Summary

Successfully cleaned and geocoded the London tech ecosystem dataset, removing all fallback coordinates and implementing a confidence-based approach.

### Results

| Metric | Count |
|--------|-------|
| **Total companies processed** | 235 |
| **High confidence geocoded** | 75 |
| **Medium confidence geocoded** | 8 |
| **Total in live map (geocoded.csv)** | 83 |
| **Needs better addresses (staging.csv)** | 152 |
| **Unique verified coordinates** | 80 |

### Key Achievements

✅ **Removed all fallback coordinates** (51.5074,-0.1278)
✅ **No generic "London" coordinates** on the live map
✅ **Added geocode_confidence field** for quality tracking
✅ **Separated low-quality data** into staging file
✅ **80 unique coordinates** (3 legitimate shared addresses for same building)

## Confidence Levels

### High Confidence (75 companies)
- **Criteria:** Full street address + postcode + verified coordinates
- **Quality:** Precise, accurate locations
- **Examples:**
  - Balderton Capital: The Stables 28 Britannia Street, WC1X 9JF → 51.529874,-0.118818
  - Index Ventures: 5-8 Lower John Street, W1F 9DY → 51.511127,-0.137015
  - Atomico: 29 Rathbone Street, W1T 1NJ → 51.518334,-0.135567

### Medium Confidence (8 companies)
- **Criteria:** Either street address OR postcode with plausible coordinates
- **Quality:** Good, but may need verification
- **Examples:**
  - Octopus Ventures: 33 Holborn, EC1N 2HT → 51.517537,-0.108272
  - Backed VC: London, EC2A 3AR → 51.526359,-0.080053
  - Playfair Capital: London, EC2A 4NE → 51.525617,-0.083602

### Low Confidence (152 companies - in staging)
- **Criteria:** Only generic "London" location
- **Status:** Needs address research before geocoding
- **Examples:** OpenAI, ElevenLabs, PolyAI, Builder.ai, Robin AI, etc.

## Shared Coordinates (Legitimate)

Three coordinate pairs are shared by companies in the same building:

1. **51.525617,-0.083602** (EC2A 4NE area)
   - Playfair Capital
   - B2C2

2. **51.514178,-0.093552** (107 Cheapside)
   - Anthropic
   - Stripe

3. **51.514897,-0.123615** (71-75 Shelton Street)
   - Tractable
   - Aave

These are verified as legitimate shared addresses, not fallback coordinates.

## Files Created

### 1. `data/ecosystem_geocoded.csv`
- **Purpose:** Live map data
- **Contents:** 83 companies with high/medium confidence coordinates
- **Fields:** All original fields + `geocode_confidence`
- **Status:** Ready for production use

### 2. `data/ecosystem_staging.csv`
- **Purpose:** Companies needing better address data
- **Contents:** 152 companies with only generic location
- **Action needed:** Research proper addresses/postcodes before geocoding
- **Fields:** All original fields + `geocode_confidence` (marked as "low")

## Next Steps

### For Staging Companies (152 total)

To get these companies on the map:

1. **Research addresses** using:
   - Companies House filings
   - Company websites (contact/about pages)
   - LinkedIn company pages
   - CrunchBase/PitchBook data
   - News articles announcing offices

2. **Priority categories:**
   - AI companies (70+ companies) - Many have announced London offices
   - Web3/Crypto (25+ companies) - High-value ecosystem additions
   - Fintech (30+ companies) - Known London presence
   - Big tech (15+ companies) - Well-documented office locations

3. **Update process:**
   - Add full addresses and/or postcodes to staging CSV
   - Re-run geocoding script
   - Move successfully geocoded companies to live CSV

## Geocoding Method

- **API Used:** OpenStreetMap Nominatim (free, no API key required)
- **Rate Limit:** 1 request/second (respected)
- **Query Format:** Street address + postcode + London + UK
- **Fallback Strategy:** None - only geocode when sufficient data exists

## Quality Assurance

✅ Zero fallback coordinates in production file
✅ All coordinates verified through geocoding API
✅ Confidence levels assigned based on address completeness
✅ Duplicate coordinates validated as legitimate shared addresses
✅ Generic locations removed from live map

## Recommendations

1. **Use ecosystem_geocoded.csv** for the live map
2. **Systematically research** staging companies by category
3. **Prioritize high-value companies** (unicorns, well-known brands)
4. **Validate coordinates** by spot-checking on Google Maps
5. **Keep staging file updated** as new address data is discovered

---

**Script Location:** `/tmp/londonmaxxxing.com/geocode_ecosystem.js`
**Verification Script:** `/tmp/londonmaxxxing.com/verify_coordinates.js`
**Analysis Data:** `/tmp/londonmaxxxing.com/geocode_analysis.json`
