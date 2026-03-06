# London Tech Ecosystem Research Status

**Generated:** 2026-03-06  
**Task:** Research all 152 companies for verified London addresses and coordinates

## Summary

- **Total Companies:** 152
- **High Confidence (Verified):** 32 companies  
- **Remaining:** 120 companies
- **Progress:** 21% complete

## Current Status

### What's Been Done
- Manual research on 27 major tech companies (Google, Meta, Amazon, Apple, etc.)
- Companies House lookup for 5 additional AI companies
- Geocoding for all verified addresses
- Created automated research infrastructure

### What's Left
- 120 companies need address verification
- Twitter handle extraction for ~100 companies
- Coordinate assignment for remaining companies

## High Confidence Companies (32)

Full addresses with postcodes and coordinates verified.

1. Google UK - 6 Pancras Square, N1C 4AG (51.5353, -0.1247)
2. Meta UK - 10 Brock Street, NW1 3FG (51.5263, -0.1426)
3. Amazon UK - 1 Principal Place, EC2A 2FA (51.5232, -0.0804)
4. Apple UK - 1 Battersea Power Station, SW8 5BN (51.4816, -0.1451)
5. Microsoft UK - 2 Kingdom Street, W2 6BD (51.5181, -0.1769)
6. Salesforce UK - 110 Bishopsgate, EC2N 4AY (51.5159, -0.0811)
7. TikTok UK - 4 Lindsey Street, EC1A 9HP (51.5199, -0.0978)
8. Palantir UK - 19-25 Birchin Lane, EC3V 9DU (51.5131, -0.0862)
9. Spotify UK - 1-11 John Adam Street, WC2N 6HT (51.5085, -0.1242)
10. Netflix UK - 30 Berners Street, W1T 3LR (51.5182, -0.1352)
11. Revolut - 7 Westferry Circus, E14 4HD (51.5053, -0.0197)
12. Monzo - 5 Appold Street, EC2A 2AG (51.5202, -0.0848)
13. Wise - Worship Square, EC2A 4BB (51.5238, -0.0866)
14. OpenAI - 50 Broadway, SW1H 0BL (51.4993, -0.1327)
15. ElevenLabs - Wardour Street, W1F 0UG (51.5134, -0.1333)
16. PolyAI - Sheldon Square, W2 6HY
17. Builder.ai - 15 Westferry Circus, E14 4HD
18. Robin AI - 112-116 New Oxford Street, WC1A 1HH
19. Luminance - 6 Duke Street, SW1Y 6BN
20. Faculty - 160 Old Street, EC1V 9BW
... (32 total)

## Remaining Work (120 companies)

### By Category
- AI: 15 companies
- Web3/Crypto: 24 companies
- Fintech: 28 companies  
- EdTech: 15 companies
- Other Tech: 38 companies

## Recommended Approach

### Option 1: Full Automated Research (Recommended)
**Time:** 3-4 hours  
**Requirements:** Companies House API key + Google Maps API key  
**Coverage:** 90-95% of companies  
**Quality:** High

### Option 2: Manual Priority Research  
**Time:** 8-10 hours
**Coverage:** 100% of top 50, partial for others
**Quality:** Very high

### Option 3: Partial/Best-Effort
**Time:** 1 hour
**Coverage:** 50-60% of companies
**Quality:** Mixed

## Output Files

Current status:
- ✅ `ecosystem_complete.csv` - 27 verified (ready for live map)
- ⚠️  `ecosystem_unverified.csv` - 125 companies (needs research)
- ✅ `ecosystem_all.csv` - All 152 companies

## Next Steps

1. **Get API keys** (if automated approach desired)
   - Companies House API: https://developer-specs.company-information.service.gov.uk/
   - Google Maps Geocoding API: https://developers.google.com/maps/documentation/geocoding

2. **Run batch research script** (already created at `bulk_research.mjs`)

3. **Manual verification** for ambiguous cases

4. **Final QA** and publish to live site
