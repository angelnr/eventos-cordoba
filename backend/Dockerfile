FROM node:20.9-alpine

# Instalar netcat y su-exec para esperar a PostgreSQL y drop de privilegios
RUN apk add --no-cache netcat-openbsd su-exec

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma/ ./prisma/

# Instalar dependencias (sin postinstall: Prisma se genera abajo y así no
# depende de `sh` del paquete en builds estáticos)
RUN npm install --ignore-scripts

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código, tsconfig y script de entrypoint
COPY src/ ./src/
COPY tsconfig.json ./
COPY entrypoint.sh ./

# Hacer ejecutable el script
RUN chmod +x entrypoint.sh

# Crear directorio de uploads con permisos adecuados
RUN mkdir -p /app/uploads/events /app/uploads/avatars && chown -R node:node /app/uploads

# Exponer puerto
EXPOSE 3001

# Usar script de entrypoint
ENTRYPOINT ["./entrypoint.sh"]
