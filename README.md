# 🚀 Project Overview

This personal Trading Journal web application is built using:

- Astro (latest stable version) – Web framework
- Tailwind CSS – UI styling (zinc colors, minimalist dark theme)
- SQLite – Database system
- Prisma ORM – Database interaction
- Vitest – Test-driven development (TDD)
- Yarn – Package management
- Git – Version control (GitHub)

The journal is intended solely for personal use:

- Secure data entry: Only the owner (you) can create, update, or delete data.
- Public visibility: The journal can be viewed publicly (read-only).

# 🎯 Goals & Key Features

## Core Features

- Trade Logging: Record trades with detailed entry and exit information.
- Broker Management: Track and manage multiple brokers.
- Portfolio Management: Organize trades into portfolios for long-term investments.
- Partial Closures: Support tracking of partial position closures.
- Dividend Tracking: Manage and track dividends for long-term investments.
- Performance Analytics: Weekly/monthly performance summaries, portfolio-specific analytics.
- Public Dashboard: Clear visualization of overall trading and investment performance.

# 🗓️ Project Roadmap (Sprints)

| Sprint | Goal                                       | Details                                                       |
| ------ | ------------------------------------------ | ------------------------------------------------------------- |
| 1      | Setup & Auth                               | Astro, Tailwind, Prisma, SQLite, Vitest, Basic Authentication |
| 2      | Broker Management                          | CRUD operations for brokers                                   |
| 3      | Trades & Portfolios                        | CRUD operations & linking portfolios/trades                   |
| 4      | Partial Closures & Dividends               | Add partial closures and dividends management                 |
| 5      | Performance Analytics                      | Analytics per portfolio, broker, trade                        |
| 6      | Public Dashboard & Final UI/UX Refinements | Publicly accessible views & UI polish                         |

# 🔐 Security & Access

- Authentication:
  - Secure login (email/password).
  - Restricted CRUD operations (trades, brokers, portfolios).
- Public Access:
  - Read-only views (no modifications allowed publicly).

# 🚩 Conclusion

This structured approach creates a flexible, secure, maintainable, and easily scalable trading
journal application tailored explicitly for personal use while respecting software best practices
and clear data modeling conventions.
