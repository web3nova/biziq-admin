# BizIQ Admin

Internal super-admin dashboard for the BizIQ platform. Talks to the same backend as the main product (`BACK-END-WHATSAPP-PRO`) — no separate API.

## Stack
- Vite + React + Tailwind
- Auth: same two-step OTP login as the main app (`/auth/login` → `/auth/verify-otp`), gated to `isSuperAdmin` accounts only

## Setup

```bash
npm install
cp .env.example .env.local   # point VITE_API_URL at your backend
npm run dev
```

## Features
- **Overview** — platform-wide stats (tenants, users, orders)
- **Tenants** — list/search all tenants, suspend/activate accounts
- **Admins** — manage super-admin accounts

## Backend endpoints used
All under `/admin/*`, protected by `requireSuperAdmin` middleware in the backend:
- `GET /admin/stats`
- `GET /admin/tenants`
- `PATCH /admin/tenants/:id/suspend` / `/activate`
- `PATCH /admin/tenants/:id/plan`
- `GET /admin/tenants/:tenantId/users`
- `PATCH /admin/users/:userId/ban` / `/unban` / `/role`
- `GET /admin/admins`, `POST /admin/admins`, `DELETE /admin/admins/:id`
