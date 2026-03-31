# Al Faheem API

Express + Prisma + MySQL (XAMPP). REST base path: `/api/v1`.

## Setup (XAMPP)

1. Start **MySQL** in XAMPP and **create the empty database** `al_faheem` (phpMyAdmin → New, or SQL: `CREATE DATABASE al_faheem CHARACTER SET utf8mb4;`). The seed will fail with “Database does not exist” until you do this.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` (default: `mysql://root:@localhost:3306/al_faheem`).
3. Install dependencies: `npm install`
4. Sync schema: `npm run db:push` (or `npm run db:migrate`)
5. Seed: `npm run db:seed`
6. Run: `npm run dev` — uses **nodemon** (reload on `src/**` changes), port **4000**

**Admin login (after seed):** `admin@al-faheem.local` / `Admin123456`

## Key endpoints

- `POST /api/v1/auth/register` | `login` | `refresh` | `logout`
- `GET /api/v1/users/me` (Bearer token)
- `GET /api/v1/subjects` (public)
- `GET /api/v1/subjects/:slug/questions` (auth + trial/subscription)
- `POST /api/v1/exams/start` — body `{ "templateCode": "TRIAL_24" }` or `{ "subjectSlug": "algebra", "difficulty": 2 }`
- `GET/POST /api/v1/exams/attempts/:id` (answer, submit)
- `POST /api/v1/feedback`, `POST /api/v1/contact`
- `GET /api/v1/plans`, `POST /api/v1/checkout/session` (stub 501 until PSP wired)
- Admin: `GET /api/v1/admin/*` with `Authorization: Bearer <admin_access_token>`

Static uploads: `GET http://localhost:4000/uploads/images/...`

## CORS

Set `LEARNER_ORIGIN` and `ADMIN_ORIGIN` in `.env` to your Vite dev URLs (e.g. `http://localhost:5173`, `http://localhost:5174`).
