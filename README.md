# 🏠 Rental Tracker

A personal rental management dashboard for tracking rented-out properties — apartments, houses, and wedding halls — along with tenant details, rent due dates, and payment status.

Unlike a public booking platform, this app is designed for a **single property owner** to manage their own rentals. There's no login system, and payments are logged manually (you collect rent in real life, then mark it as paid in the app).

## Features

- **Dashboard** — see total properties, this month's expected vs collected rent, and overdue payments at a glance
- **Properties** — browse all your properties in a card-based view, filterable by type
- **Property detail** — view a property's tenant history and payment log
- **Payments** — central table of every payment across all properties, with a one-click "Mark as Paid" action
- **Add Tenant/Booking** — register a new tenant (recurring monthly rent) or a one-time booking (e.g. wedding hall event)

## Tech Stack

- **Next.js 14** (App Router) — handles both frontend pages and backend API routes
- **Prisma ORM** + **SQLite** — simple, file-based database (swap to PostgreSQL later if deploying publicly)
- **Tailwind CSS** — styling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Data Model

- **Property** — a rentable unit (apartment, house, wedding hall, etc.)
- **Tenant** — a person renting a property, either on a recurring (monthly) or one-time (event) basis
- **Payment** — a rent/booking payment record linked to a tenant, with status Paid / Due / Overdue

## Roadmap

- [ ] Email/SMS reminders before rent is due
- [ ] Monthly income reports and charts
- [ ] Document uploads (ID, rental agreement)
- [ ] Search and filter properties

## Screenshots

_Add screenshots here once you've run the app locally._
