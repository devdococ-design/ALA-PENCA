# T-Jardin

Sitio web de **T-Jardin** — venta de plantas, hospital de plantas y guía de cuidados (ES/EN).

## Stack

- **Frontend:** Angular 19 standalone, SCSS, i18n ES/EN
- **Backend:** NestJS + Prisma + SQLite
- **CMS:** panel en `/admin`

## Arranque rápido

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

API en `http://localhost:3000`

Admin por defecto:
- email: `admin@t-jardin.local`
- password: `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App en `http://localhost:4200`

## Rutas públicas

| Ruta | Uso |
|------|-----|
| `/` | Landing (hero, servicios, galería, nosotros, tips, FAQ) |
| `/catalogo` | Catálogo de plantas |
| `/p/:slug` | Ficha de planta (destino del QR en macetas) |
| `/hospital` | Agenda de citas del hospital |
| `/tips` | Blog / tips de cuidados |
| `/admin` | CMS (plantas, citas, tips) |

## QR de macetas

El código QR de cada maceta debe apuntar a:

`https://TU-DOMINIO/p/{slug}`

Ejemplo: `/p/monstera-deliciosa`

## Pendientes (según brief)

- Datos de contacto reales
- CTA del hero (frase pendiente)
- Formulario de contacto (sección oculta por ahora)
- Hosting

## Diseño

Colores: verde bosque, naranja y negro. Tipografías: Fraunces + Manrope. Estilo natural y minimal.
