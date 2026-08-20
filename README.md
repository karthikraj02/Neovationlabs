# NeovationLabs

AI Engineering & Intelligent Software Infrastructure — a production-quality MERN
marketing site and API for a fictional AI engineering studio.

> NeovationLabs is an original brand created for this project. It is visually and
> structurally inspired by the premium dark-mode SaaS aesthetic common among
> AI startup sites, but contains no copied code, copy, or assets from any
> specific company.

## Features

- Animated, art-directed homepage: network-diagram hero, interactive service
  cards, architecture flow diagrams (AI Engineering, Agentic AI, Software
  Engineering layered stack), an animated Data Engineering pipeline,
  illustrative computer-vision demo, technology ecosystem, process timeline,
  solutions grid, concept case studies, capability metrics, closing CTA
- 7 detailed service pages at `/services/:slug` with problem/solution,
  capabilities, use cases, and FAQ, plus `Service` JSON-LD structured data
- About, Solutions, Technology, Insights (blog, with full long-form articles),
  Contact, Privacy, Terms, and a custom 404
- Services and Insights list pages fetch live from the API with real
  loading / error / retry states, falling back to bundled content (with a
  visible notice) if the API is unreachable
- Contact form with client + server-side validation (Zod), rate limiting,
  a honeypot field for basic spam protection, and email notification
  (Nodemailer, optional)
- Global Organization/WebSite JSON-LD in `index.html`, per-page `Service`/
  `BlogPosting` schema, and per-route document title + meta description
- Responsive down to 320px, keyboard-accessible, respects
  `prefers-reduced-motion`
- SEO metadata, Open Graph tags, `robots.txt`, `sitemap.xml`
- Automated tests: Jest/Supertest on the API (9 tests — health, contact
  validation, NoSQL-injection resistance, honeypot, rate limiting, DB-failure
  handling) and Vitest/Testing Library on the frontend (11 tests — routing,
  navigation, contact form validation and submission states)

## Technology Stack

**Frontend** — React 19, Vite, Tailwind CSS v4, Framer Motion, React Router,
Lucide React, Axios, React Hook Form + Zod

**Backend** — Node.js, Express 5, MongoDB + Mongoose, Helmet, CORS,
express-rate-limit, Morgan, Nodemailer, Zod

**Database** — MongoDB (MongoDB Atlas in production)

## Project Architecture

```
neovationlabs/
├── client/                 Vite + React frontend
│   └── src/
│       ├── components/
│       │   ├── layout/     Navbar, Footer, RootLayout
│       │   ├── sections/   Homepage sections (Hero, Services, Process, ...)
│       │   └── ui/         Reusable primitives (Button, GlowCard, ...)
│       ├── data/           Static content (services, solutions, insights)
│       ├── pages/          Route-level pages
│       └── lib/            Utilities
├── server/                 Express + MongoDB backend
│   └── src/
│       ├── config/         Env loading, DB connection
│       ├── controllers/    Route handlers
│       ├── middleware/     Security, rate limiting, validation, errors
│       ├── models/         Mongoose schemas
│       ├── routes/         Express routers
│       ├── services/       Email notification service
│       └── validators/     Zod request schemas
│   ├── scripts/seed.js     Populates Services + Insights collections
│   └── tests/              Jest + Supertest API tests
└── package.json             Root workspace scripts
```

## Installation

Requires Node.js 18+ and a MongoDB connection string (Atlas or local).

```bash
git clone <this-repo>
cd neovationlabs
npm install
```

This installs both `client` and `server` via npm workspaces.

## Environment Variables

Copy the example files and fill in real values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas / local connection string |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | Optional — enables contact-form email notifications. If left blank, submissions still save to MongoDB, email is just skipped. |
| `CONTACT_NOTIFY_EMAIL` | Optional — where notification emails are sent (defaults to `SMTP_USER`) |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:5000` |

## Running Locally

From the project root:

```bash
npm run dev
```

Runs the client (`http://localhost:5173`) and server (`http://localhost:5000`)
concurrently. Or run them separately:

```bash
npm run dev:client
npm run dev:server
```

## Database Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (or run MongoDB locally).
2. Add the connection string to `server/.env` as `MONGODB_URI`.
3. Seed the Services and Insights collections (optional — the frontend has
   its own static copies of this content and works without seeding):

   ```bash
   npm run seed
   ```

## API Documentation

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — `{ status: "ok", service: "neovationlabs-api" }` |
| `POST` | `/api/contact` | Submit a project inquiry. Rate-limited (5 / 15 min per IP). Validates and sanitizes input, saves to MongoDB, sends an email notification if SMTP is configured. |
| `GET` | `/api/services` | List services (from MongoDB, if seeded) |
| `GET` | `/api/services/:slug` | Get one service |
| `GET` | `/api/insights` | List insights/blog posts (from MongoDB, if seeded) |
| `GET` | `/api/insights/:slug` | Get one insight |

**Example — `POST /api/contact`**

```json
{
  "name": "Ada Lovelace",
  "company": "Analytical Engines Inc.",
  "email": "ada@example.com",
  "phone": "",
  "projectType": "Generative AI",
  "budget": "$25k – $75k",
  "message": "We'd like to explore an internal knowledge assistant."
}
```

Response:

```json
{ "success": true, "message": "Your project request has been received.", "id": "..." }
```

## Testing

```bash
npm test              # server (Jest) + client (Vitest)
npm run test:server   # server only
npm run test:client   # client only
```

**Server** — Jest/Supertest against the real Express app: health check,
unknown-route 404, contact-form validation (valid, empty, invalid, NoSQL-
injection-style, and honeypot-triggered input), simulated database failure,
and a dedicated test proving the `/api/contact` rate limiter actually returns
`429` after 5 requests. Database calls are mocked, so tests don't require a
live MongoDB connection.

**Client** — Vitest + React Testing Library: route rendering (home page and
the 404 fallback for unknown routes), Navbar links and mobile menu toggle,
and ContactForm validation, submission, error handling, and honeypot
visibility.

## Deployment

- **Frontend** — deploy `client/` to Vercel (or any static host). Set
  `VITE_API_URL` to your deployed API's URL.
- **Backend** — deploy `server/` to Render, Railway, or a similar Node host.
  Set the environment variables from `server/.env.example`.
- **Database** — MongoDB Atlas, with `MONGODB_URI` set on the backend host.

The frontend production build (`npm run build`) has been verified to build
cleanly with `oxlint` reporting zero warnings.

## Security

- `helmet` for secure HTTP headers
- CORS restricted to `CLIENT_URL`
- Rate limiting: 5 requests / 15 min on `/api/contact`, 300 / 15 min globally
  (verified by a dedicated test, not just configured and assumed)
- A honeypot field on the contact form, validated on both client and server,
  as a first line of defense against basic bots without a CAPTCHA
- Request body size capped at 20kb
- All input validated server-side with Zod (client-side validation is a
  convenience, not a security boundary)
- Custom NoSQL-injection sanitizer on `req.body` (Express 5 makes `req.query`
  read-only, so the widely-used `express-mongo-sanitize` package is
  incompatible with this Express version — this project ships an equivalent
  body sanitizer instead)
- No secrets committed — see `.env.example` files
- Centralized error handler that never leaks stack traces in production

## Known Limitations / Roadmap

This is a real, working implementation but a first release, not a finished
product. Explicitly not yet built:

- Admin dashboard for reviewing contact submissions and managing content
  (the backend architecture — separate models, REST routes — supports adding
  one later without a rework)
- Authentication / JWT is not wired up, since no part of the current site
  requires a login
- Automated visual regression / cross-browser QA — verified via a production
  build, `oxlint`, and automated test suites (20 tests total across client
  and server), not a live multi-browser or Lighthouse pass, since this
  environment doesn't have a real browser to drive
- The Services and Insights **detail** pages (`/services/:slug`,
  `/insights/:slug`) use the richer bundled content (problem/solution/FAQ,
  full article text) rather than fetching from the API, because the current
  Mongoose models don't yet capture that level of editorial detail — the
  **list** pages do fetch live from the API. Extending the `Service` and
  `Insight` schemas to carry the full detail content is the natural next step
  if this becomes fully CMS-driven.

## License

Proprietary — all rights reserved, NeovationLabs (fictional demonstration project).
