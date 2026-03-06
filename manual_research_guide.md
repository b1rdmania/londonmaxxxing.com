# Manual Research Process for 152 London Companies

## Process Overview

For each company, we need:
1. **Verified London address** (street + postcode preferred)
2. **Latitude/Longitude** from Google Maps
3. **Twitter handle** from company website
4. **Confidence level** (high/medium/low)

## Confidence Criteria

- **HIGH**: Street address + postcode verified on Google Maps
- **MEDIUM**: Address verified but incomplete (e.g., building name + postcode, or area + postcode)
- **LOW**: Only generic "London" or cannot verify

## Research Sources (in order of priority)

1. **Company official website** - Contact/About pages
2. **Companies House** - https://find-and-update.company-information.service.gov.uk/
3. **LinkedIn company page** - Often has address in "About" section
4. **Crunchbase** - Company profiles sometimes have addresses
5. **Google Maps** - Search "Company Name London"
6. **Company press releases** - Office opening announcements

## Batch Processing Strategy

### Batch 1: Known Major Tech Companies (35 companies)
Google, Meta, Amazon, Apple, Microsoft, Salesforce, etc.
→ Use known_addresses.json as baseline

### Batch 2: UK Fintech (30 companies)
Revolut, Monzo, Wise, etc.
→ Well-documented, easy to find via Companies House

### Batch 3: AI Companies (23 companies)
OpenAI, ElevenLabs, Graphcore, Darktrace, etc.
→ Recent office openings often announced

### Batch 4: Web3/Crypto (24 companies)
Elliptic, Blockchain.com, Coinbase, etc.
→ Some may have moved/closed UK offices

### Batch 5: EdTech (15 companies)
Multiverse, Century Tech, etc.
→ Check Companies House for registered addresses

### Batch 6: Other Tech/Healthtech (25 companies)
Remaining companies
→ Manual lookup required

## Output Format

CSV with columns:
- id
- name
- category
- address (full street address)
- postcode
- city (London)
- country (UK)
- website
- source_url
- notes
- latitude
- longitude
- twitter
- geocode_confidence

## Progress Tracking

Create intermediate saves after each batch to avoid data loss.
