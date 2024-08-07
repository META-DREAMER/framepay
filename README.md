# FramePay

NextJS + Drizzle + TailwindCSS + TypeScript app for farcaster frame to mint + redeem a physical item via Shopify.

## Getting Started

1. Ensure bun.sh is installed on your system as package manager (`curl -fsSL https://bun.sh/install | bash` on macOS/Linux)
2. Run `bun i` to install all dependencies
3. Setup your .env file with variables from .env.example
4. Run `bun dev` to start the Next.js dev server
5. Run `start-database.sh` to start a local Postgres docker container (or connect to production DB)
6. Run `bun db:studio` to run Drizzle Studio to interact with the Database
7. If you make changes to graphql queries / mutations, run `bun codegen` to regenerate the types

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.
[.env](.env)
- [Next.js](https://nextjs.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

