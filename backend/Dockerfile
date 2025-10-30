FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY src/ ./src/

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar
CMD ["node", "src/index.js"]
