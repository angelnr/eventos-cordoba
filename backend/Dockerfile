FROM node:24.22.1-alpine

# Instalar netcat y su-exec para esperar a PostgreSQL y drop de privilegios.
# openssl: necesario para que Prisma detecte el engine correcto en Alpine.
RUN apk add --no-cache netcat-openbsd su-exec openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma/ ./prisma/

# Instalar dependencias (sin postinstall: Prisma se genera abajo y así no
# depende de `sh` del paquete en builds estáticos)
RUN npm install --ignore-scripts

# Generar cliente Prisma
RUN npx prisma generate

# El entrypoint ejecuta `prisma db push` como usuario `node` (su-exec):
# darle propiedad de los directorios de engines/cliente que Prisma
# reescribe en runtime.
RUN chown -R node:node /app/node_modules/@prisma /app/node_modules/.prisma

# Copiar código, tsconfig y script de entrypoint
COPY src/ ./src/
COPY tsconfig.json ./

# Compilar TypeScript en el build: el runtime no necesita ts-node/tsc
RUN npm run build

COPY entrypoint.sh ./

# Hacer ejecutable el script
RUN chmod +x entrypoint.sh

# Crear directorio de uploads con permisos adecuados
RUN mkdir -p /app/uploads/events /app/uploads/avatars && chown -R node:node /app/uploads

# Exponer puerto
EXPOSE 3001

# Usar script de entrypoint
ENTRYPOINT ["./entrypoint.sh"]
