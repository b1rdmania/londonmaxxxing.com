# Londonmaxxxing.com MVP

Map-first MVP for startup office availability in Shoreditch and East London.

## Stack

- Next.js (App Router, TypeScript)
- MapLibre GL + react-map-gl
- Seeded in-memory data (30 listings + ecosystem points)

## Run Locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Environment Variables

Copy `.env.example` to `.env.local`.

- `MAPBOX_TOKEN` (optional for this MVP; required if you switch to Mapbox tiles)
- `SUPABASE_URL` (future data backend)
- `SUPABASE_KEY` (future data backend)

## MVP Features Included

- Map-first landing experience
- Office marker clustering
- Marker color by price tier (green/amber/red)
- Marker size by desk capacity
- Marker popup with normalized pricing fields
- Optional VC office layer toggle
- Optional tech office layer toggle

## Data Model

See `/lib/types.ts` and `/lib/data.ts` for the normalized listing schema used by the map layer.

## Deployment

Deploy directly to Vercel:

1. Push this folder to a GitHub repo.
2. Import repo in Vercel.
3. Add env vars from `.env.example`.
4. Deploy.
