# Geocoding Task - Strict Rules

## Problem
Current ecosystem.csv has many companies sharing the same fallback coordinate (51.5074,-0.1278) because they only had "London" as address.

## Rules (MUST FOLLOW)

1. **If address is only "London" (or similarly generic), do not assign a precise lat/lon.**
2. **Only geocode when it has at least one of:**
   - Full street address, OR
   - Postcode, OR
   - Verified office location source
3. **Add a `geocode_confidence` field** (high, medium, low) and only publish high/medium to the live map
4. **Keep unresolved rows in a staging CSV**, not the main live CSV
5. **Never use one fallback coordinate for multiple companies**

## Output Files

- `data/ecosystem_geocoded.csv` - Only rows with high/medium confidence coordinates
- `data/ecosystem_staging.csv` - Rows that need better addresses (low confidence or no geocode)

## Geocode Confidence Levels

- **high**: Has exact street address + postcode, verified via Google Maps API
- **medium**: Has either street address OR postcode, plausible coordinate
- **low**: Only has "London" or similarly generic location - DO NOT GEOCODE

## Process

1. Read current ecosystem.csv
2. For each row:
   - Check if address/postcode is specific enough
   - If yes: geocode via Google Maps API, assign confidence
   - If no: mark as low confidence, move to staging
3. Split into geocoded (high/medium) and staging (low/none) CSVs
4. Report exact counts for QA

## Current State

235 total companies, many sharing 51.5074,-0.1278 fallback coordinate.

Need to:
- Remove fallback coordinates
- Find real addresses for companies currently showing only "London"
- Only geocode when we have verifiable address data
