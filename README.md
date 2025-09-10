# Branded Package Generator (MVP)

Generate branded **booklet** and **forms** PDFs by uploading a logo and company name (with optional brand color). Supports **batch CSV** for many in one go.

## Stack
- Next.js 14 (App Router)
- Handlebars templates → HTML
- puppeteer-core + @sparticuz/chromium → PDF (Vercel-compatible)
- Jimp → brand color extraction (no native deps)
- PapaParse → CSV
- JSZip → ZIP

## Dev
```bash
npm i
npm run dev
```

## Deploy (Vercel)
- Set Node.js to **20** in Vercel Project Settings.
- Import the repo and deploy. `vercel.json` increases API function limits.

## Batch CSV schema
```
company_name,primary_color,logo_base64
Acme Movers,#0C5FDB,iVBORw0K...
Bravo Removals,,iVBORw0K...
```
Tip: base64 your PNG logo with Node: `fs.readFileSync('logo.png','base64')`.
