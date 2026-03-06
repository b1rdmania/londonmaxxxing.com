# Address Research Batch Process

## Approach

For 152 companies, manual research via Google Maps for each is impractical. Instead:

1. **Companies House API** - Get registered office addresses for UK companies (authoritative)
2. **Google Maps verification** - Verify addresses exist and geocode
3. **Twitter extraction** - Extract from company websites/social links

## Companies House API

Free API, no key required for basic lookups:
- Search: `https://api.company-information.service.gov.uk/search/companies?q=COMPANY_NAME`
- Get company: `https://api.company-information.service.gov.uk/company/COMPANY_NUMBER`

Returns:
- Registered office address
- Postcode
- Company status

## Implementation Plan

### Phase 1: Companies House Lookup (Batch 1-50)
- Search for each company name
- Extract registered address + postcode
- Store in intermediate JSON

### Phase 2: Google Maps Geocoding (Batch 51-100)
- Use Google Geocoding API (or fallback to web search)
- Get lat/long for each address
- Verify address exists

### Phase 3: Twitter Extraction (Batch 101-152)
- Check company websites for Twitter links
- Extract handles

### Phase 4: Merge & Validate
- Combine all data
- Check for duplicates (same coordinates)
- Generate final CSV
