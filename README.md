# Secure Invoicing Pro (No Backend)

A modern, minimal, **client‑side** invoicing app (React + Vite + TypeScript + Tailwind) inspired by your reference.  
Features:

- Invoice builder with items, tax, discount, notes, logo
- Clean invoice print/PDF (use the browser's **Print → Save as PDF**)
- **Payment link** generator (data encoded in URL)
- Payment page with **PayPal Smart Buttons** (client‑side `createOrder`/`capture`)
- Settings: store **PayPal Client ID**, theme color, and logo in **localStorage**
- No database / backend required

> **Note on secrets**: PayPal **Secret** must never be used on the client. This app only needs the **Client ID** for PayPal buttons (OK for simple client‑side flows). For cards and Pay Later, PayPal will show eligible options automatically.

## Quickstart

```bash
npm i
npm run dev
```

Open http://localhost:5173.

1. Go to **Settings** and paste your **PayPal Client ID** (Sandbox or Live).
2. Build an invoice on **Invoices**.
3. Click **Copy Payment Link** and open it in a new tab (or send to your payer).
4. On the payment page, PayPal buttons will appear (if Client ID exists). Approvals are captured client‑side for demo purposes.

## Architecture

- **Vite + React + TS** for app
- **Tailwind** for styling, minimal UI components in `/src/components/UI.tsx`
- **State & persistence**: localStorage via `/src/lib/storage.ts`
- **Payment**: PayPal SDK loaded on demand in `/src/lib/paypal.ts`
- **Routes**:
  - `/` — Invoice builder
  - `/settings` — PayPal + Theme + Logo
  - `/payment?data=...` — Public payment page (URL‑encoded JSON payload)

## Why no Secret?

Your reference asked for Access Key + Secret Key, but front‑end apps cannot keep secrets safe.  
Using PayPal purely client‑side is acceptable for basic Smart Buttons. For advanced features (server‑verified orders, webhooks, card fields), add a small backend later.

## Customize

- Colors: edit `tailwind.config.js` or set Theme color in Settings (used in future style extensions)
- Invoice layout: `/src/components/InvoicePaper.tsx`
- Link encoding: `makeShareLink()` in `/src/lib/storage.ts`

## Deploy

Build and host as static site:

```bash
npm run build
# Deploy `dist/` to Netlify / Vercel / CloudFront / S3 / etc.
```