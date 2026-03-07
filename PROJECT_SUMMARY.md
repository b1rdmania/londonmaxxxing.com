# London Tech Heatmap - Project Summary

## Overview
Interactive map showcasing London's tech ecosystem with 293 companies across 9 categories.

## Recent Updates (March 7, 2026)

### Companies Added
- **Karatage** (web3) - Multi-strategy crypto hedge fund, 40 Portland Place
- **Plasma** (web3) - Stablecoin neobank ($373M, Peter Thiel-backed), 46 Portland Place
- **UCL AI Centre** (edu) - 90 High Holborn
- **Teya** (fintech) - Payments platform, 100 Victoria Embankment
- **xAI** (ai) - Elon Musk's AI company (Grok), 20 Air Street (former Twitter UK office)
- **Lightdash** (ai) - Open-source AI-native BI platform, Exmouth House
- **21 funding organizations** - Government agencies (Innovate UK, ARIA, British Business Bank) and philanthropic orgs (Wellcome Trust, Nuffield Foundation, Leverhulme Trust, Gatsby, Longview Philanthropy, Giving What We Can, London Initiative for Safe AI)

### Events Page Built
- Created `/events` route pulling from Supabase API
- Category filtering with toggle buttons
- Responsive design matching main site
- Mobile optimizations: single column grid, visible toggles
- Currently standalone (not linked from main nav)

### UI Improvements
- **Mobile header optimization**: Smaller fonts (18px title, 11px text), hide Share/Embed on iOS
- **Toggle spacing**: Reduced gap from 12px to 6px for better fit
- **Popup improvements**: 3x bigger close button (40x40px, 32px font)
- **Consistent branding**: "London tech heatmap 🔥" (capitalized)
- **Share/Embed**: Combined into single bracket `[Share / Embed]`

### Technical Details
- CSV format with quoted fields to handle commas in addresses
- 9 categories: VC, Funding, AI, AI×Bio, Fintech, Web3, Coworking, Education, Big Tech
- MapLibre GL for mapping
- Next.js 14 App Router
- All changes committed with "Co-Authored-By: Claude Sonnet 4.5"

## Stats
- **Total companies**: 293
- **Categories**: 9
- **Geographic coverage**: Central London (Shoreditch, King's Cross, Soho, Marylebone, etc.)

## Stack
- Next.js 14 (App Router, TypeScript)
- MapLibre GL JS + react-map-gl
- CSV-based data source
- Deployed on Vercel

## Links
- Live site: https://londonmaxxxing.com
- Events (standalone): https://londonmaxxxing.com/events
- GitHub: https://github.com/b1rdmania/londonmaxxxing.com
- Built with: GhostClaw
