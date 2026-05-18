# Aura Enterprise Engine

Enterprise inventory dashboard built with Next.js. Server-side paginated grid for 50,000+ SKUs, advanced filtering, debounced search, analytics charts, and CSV export.

## Stack

Next.js 14 • TypeScript • Tailwind CSS • TanStack Table • Recharts • lodash.debounce • PapaParse

## Quick Start

```bash
npm install
npm run dev
```


## Routes

- `/` — Analytics dashboard with KPIs, charts, and restock priority
- `/inventory` — Server-paginated inventory grid with filters and sort
- `/api/inventory` — Paginated inventory data endpoint
- `/api/analytics` — Summary metrics and charts data

## Features

✓ 50,000 deterministic inventory records  
✓ Server-side pagination (configurable page size)  
✓ Omnisearch with 450ms debounce  
✓ Advanced filters (category, status, stock, price)  
✓ TanStack Table sorting  
✓ Full-dataset CSV export  
✓ Dark enterprise theme  
✓ Fully responsive  



## Project Structure

```
app/
├── page.tsx                    # Dashboard home
├── inventory/page.tsx          # Inventory grid
├── api/inventory/route.ts      # Data API
└── globals.css
components/
├── dashboard/                  # Chart and metric components
└── inventory/                  # Grid, search, filters
lib/
└── inventory-data.ts           # 50k records, queries, analytics
```



