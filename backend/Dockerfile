FROM node:20.9-alpine

# Instalar netcat para esperar a PostgreSQL
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma/ ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código, tsconfig y script de entrypoint
COPY src/ ./src/
COPY tsconfig.json ./
COPY entrypoint.sh ./

# Hacer ejecutable el script
RUN chmod +x entrypoint.sh

# Crear directorio de uploads con permisos adecuados
RUN mkdir -p /app/uploads/events && chown -R node:node /app/uploads

# Exponer puerto
EXPOSE 3001

# Usar script de entrypoint
ENTRYPOINT ["./entrypoint.sh"]
