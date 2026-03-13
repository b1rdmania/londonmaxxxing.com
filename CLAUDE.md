# London Maxxxing - AI Assistant Context

## What This Is

Interactive map of London's tech ecosystem. Shows where VCs, AI labs, fintech companies, web3 startups, and coworking spaces are actually located.

## Key Files

**Database (SOURCE OF TRUTH)**
- `/data/ecosystem.csv` - 302 London tech companies
- Columns: id, name, category, address, postcode, city, country, website, source_url, notes, latitude, longitude, twitter
- Categories: vc, ai, ai_bio, fintech, crypto, biotech, coworking, big_tech

**Frontend**
- Next.js app deployed to Vercel
- Live site: londonmaxxxing.com
- Interactive map with filters by category

**Research Scripts**
- `bulk_research.mjs` - Automated company research
- `research_companies.mjs` - Individual company deep dives
- `linkedin_research.mjs` - LinkedIn profile extraction (in progress)

## Database Schema

```csv
id,name,category,address,postcode,city,country,website,source_url,notes,latitude,longitude,twitter
vc-001,Balderton Capital,vc,The Stables 28 Britannia Street,WC1X 9JF,London,UK,...
```

## Research Workflows

### Adding New Companies

1. Research company details (address, category, website)
2. Add to `/data/ecosystem.csv`
3. Geocode if needed (use `geocode_ecosystem.js`)
4. Commit and push (auto-deploys to Vercel)

### LinkedIn Research

Goal: Extract 3 senior London-based team members per company for network building.

Output format:
- Company ID, Company Name, Category, Website
- Member 1: Name, Title, LinkedIn URL, Location
- Member 2: Name, Title, LinkedIn URL, Location
- Member 3: Name, Title, LinkedIn URL, Location

Current progress: `linkedin_profiles_progress_batch1.csv` (~100 companies researched)

## Common Tasks

**Update the database:**
```bash
cd /Users/ziggy/londonmaxxxing-repo
# Edit data/ecosystem.csv
git add data/ecosystem.csv
git commit -m "Add new companies"
git push
```

**Run research scripts:**
```bash
node bulk_research.mjs
node research_companies.mjs
```

## Notes

- This is the **canonical** London tech database (not the old `london-tech-companies-comprehensive.md`)
- When user mentions "London Maxxxing" or "the London map", this repo is what they're talking about
- Database updates automatically propagate to the live site via Vercel
- Focus on actual office addresses (not just Companies House registered addresses)

## Old Files to Archive

- `/Users/ziggy/nanoclaw/groups/main/london-tech-companies-comprehensive.md` - Deprecated, replaced by this repo's database
