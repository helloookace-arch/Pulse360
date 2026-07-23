# Pulse360

Pulse360 is a secure, anonymous health companion platform designed to provide Rwandans and youth across Africa with judgment-free mental and reproductive health services.

## Architecture

This application has been fully migrated to run exclusively on Cloudflare infrastructure, providing a high-performance, edge-first architecture.

- **Frontend & API:** Next.js 15 (App Router) deployed on [Cloudflare Pages](https://pages.cloudflare.com/) utilizing the Edge Runtime.
- **Database:** Cloudflare D1 (Serverless SQL) for storing articles, stories, consultations, and chat sessions.
- **Cache & Sessions:** Cloudflare KV for temporary state and fast access.

## Features

- **Anonymous AI Counsel:** A secure chatbot for asking sensitive questions confidentially.
- **Virtual Consultations:** Book private video calls with licensed health professionals.
- **Community Stories:** Read and share anonymous testimonies for mutual support.
- **Health Education:** Browse articles on mental wellness, reproductive health, and healthy habits.
- **Accessibility Toolkit:** Includes voice navigation, high contrast modes, and Rwandan Sign Language (RSL) integration for inclusivity.

## Local Development

### Prerequisites
- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize local D1 database:
   ```bash
   npx wrangler d1 execute pulse360-db --local --file=./schema.sql
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Cloudflare Deployment

This project uses Cloudflare CI/CD via GitHub.

1. In the Cloudflare Pages Dashboard, connect this repository.
2. Build command: `npm install --legacy-peer-deps && npx --legacy-peer-deps @cloudflare/next-on-pages@1`
3. Build output directory: `.vercel/output/static`
4. Go to **Settings > Bindings** and add:
   - D1 Database: Variable name `DB`
   - KV Namespace: Variable name `PULSE360_KV`

## Security and Privacy
All transactions and sessions are processed anonymously to ensure maximum user safety. Crisis alerts automatically trigger notifications for national helplines (114/112).
