# ALA-PENCA

Starter template for **ALA-PENCA** — Angular + NestJS site with public catalog, appointment booking, tips/blog, gallery, and an `/admin` CMS (ES/EN).

## Stack

- **Frontend:** Angular 19 standalone, SCSS, i18n ES/EN
- **Backend:** NestJS + Prisma + SQLite
- **CMS:** panel at `/admin`

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

API at `http://localhost:3000`

Default admin (change after first login):
- email: `admin@ala-penca.local`
- password: `change-me`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App at `http://localhost:4200`

## Public routes

| Route | Purpose |
|------|---------|
| `/` | Landing (hero, services, gallery, about, tips, FAQ) |
| `/catalogo` | Catalog |
| `/p/:slug` | Item detail (QR destination) |
| `/hospital` | Appointment booking |
| `/tips` | Blog / tips |
| `/admin` | CMS |

## QR links

Point each QR to:

`https://YOUR-DOMAIN/p/{slug}`

Example: `/p/sample-item-one`

## Notes

- Copy branding, contact details, and seed content for your project.
- Keep secrets in `.env` (never commit them). See `backend/.env.example`.
