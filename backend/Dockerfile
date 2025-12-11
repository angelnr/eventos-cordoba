FROM node:20.9-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma/ ./prisma/

# Instalar dependencias
RUN npm install

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código
COPY src/ ./src/

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar
CMD ["node", "src/index.js"]
