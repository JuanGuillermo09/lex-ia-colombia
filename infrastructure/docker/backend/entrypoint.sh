#!/bin/sh
set -e

echo "-> Applying database migrations..."
npx prisma migrate deploy

echo "-> Seeding database..."
npx tsx scripts/seed.ts

echo "-> Starting server..."
exec node -r tsconfig-paths/register dist/app.js
