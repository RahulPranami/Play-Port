This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Prisma + Supabase)

This project uses [Prisma 7](https://www.prisma.io/) as the ORM, connected to a [Supabase](https://supabase.com/) PostgreSQL database.

### Configuration

Connection strings live in `.env.local` (git-ignored):

```env
# Pooled connection — used at runtime (pgBouncer)
DATABASE_URL="postgresql://..."

# Direct connection — used for migrations
DIRECT_URL="postgresql://..."
```

In Prisma 7, URLs are configured in `prisma.config.ts` (not in `schema.prisma`):

```ts
// prisma.config.ts
datasource: {
  url: process.env["DATABASE_URL"],
  directUrl: process.env["DIRECT_URL"],
}
```

### Common commands

```bash
# Install the Prisma client
npm install @prisma/client

# Generate the client after schema changes
npx prisma generate

# Create and apply a migration
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database UI)
npx prisma studio
```

### Schema

Models are defined in `prisma/schema.prisma`. The generated client is output to `src/generated/prisma`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
