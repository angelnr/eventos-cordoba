#!/bin/sh
set -e

echo "🔄 Esperando a que PostgreSQL esté listo..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL está listo!"

echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma db push --accept-data-loss
echo "✅ Migraciones completadas!"

echo "🔄 Ejecutando seed de datos..."
node prisma/seed.js
echo "✅ Seed completado!"

echo "🚀 Iniciando aplicación..."
exec node src/index.js
