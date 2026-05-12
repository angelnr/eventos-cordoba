#!/bin/sh
set -e

echo "🔄 Esperando a que PostgreSQL esté listo..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL está listo!"

echo "📁 Asegurando directorio de uploads..."
mkdir -p /app/uploads/events /app/uploads/avatars
chown -R node:node /app/uploads 2>/dev/null || true

echo "🔄 Ejecutando migraciones de Prisma..."
su-exec node npx prisma db push --accept-data-loss
echo "✅ Migraciones completadas!"

echo "🔄 Ejecutando seed de datos..."
su-exec node node prisma/seed.js
echo "✅ Seed completado!"

echo "🚀 Iniciando aplicación..."
if [ "$NODE_ENV" = "development" ]; then
  echo "📦 Modo desarrollo — usando ts-node-dev"
  exec su-exec node npx ts-node-dev --respawn --transpile-only src/index.ts
else
  echo "📦 Modo producción — compilando TypeScript..."
  su-exec node npx tsc
  echo "✅ Compilación TypeScript completada"
  exec su-exec node node dist/index.js
fi
