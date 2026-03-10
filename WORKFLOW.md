# londonmaxxxing.com - Update Workflow

## Quick Reference

**GitHub**: https://github.com/b1rdmania/londonmaxxxing.com  
**Live Site**: https://londonmaxxxing.com  
**Data File**: `data/ecosystem.csv`  
**Current Count**: 301 companies (as of March 10, 2026)

## Adding Companies

### 1. Clone/Pull Repo
```bash
cd /tmp && gh repo clone b1rdmania/londonmaxxxing.com
# Or if already cloned:
cd /tmp/londonmaxxxing.com && git pull
```

### 2. Add Entry to CSV

Format:
```csv
id,name,category,address,postcode,city,country,website,source_url,notes,latitude,longitude,twitter
```

Example:
```bash
echo 'bigtech-010,Figma,bigtech,9 Devonshire Square,EC2M 4YF,London,UK,https://figma.com,https://find-and-update.company-information.service.gov.uk/company/12523488,EMEA HQ - Design and prototyping platform,51.515907,-0.078947,figma' >> data/ecosystem.csv
```

### 3. Commit and Push
```bash
git add data/ecosystem.csv
git commit -m "Add [Company Name]"
git push
```

### 4. Auto-Deploy
Changes automatically deploy to Vercel within 1-2 minutes.

## Categories

- `vc` - Venture Capital
- `ai` - AI/ML companies
- `fintech` - Financial technology
- `bigtech` - Big tech companies
- `crypto` - Web3/blockchain
- `saas` - SaaS companies
- `healthtech` - Healthcare technology
- `edtech` - Education technology
- `climatetech` - Climate/sustainability
- `workspace` - Coworking/incubators
- `accelerator` - Startup accelerators

## Finding Company Details

1. **Address**: Check Companies House (UK) at https://find-and-update.company-information.service.gov.uk/
2. **Coordinates**: Use https://www.latlong.net/ or let geocoding handle it
3. **Twitter**: Company's @ handle without the @

## Recent Additions

- March 8: Cherry Ventures, Hummingbird, Molten (296 → 299)
- March 10: Figma (300 → 301)

## Notes

- `/tmp/londonmaxxxing.com/` directory may be cleared on restart - always clone fresh if needed
- Main data file is `data/ecosystem.csv` (not the old `london-tech-companies-comprehensive.md`)
- Site auto-deploys on push to main branch
