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

# Copiar código y script de entrypoint
COPY src/ ./src/
COPY entrypoint.sh ./

# Hacer ejecutable el script
RUN chmod +x entrypoint.sh

# Exponer puerto
EXPOSE 3001

# Usar script de entrypoint
ENTRYPOINT ["./entrypoint.sh"]
