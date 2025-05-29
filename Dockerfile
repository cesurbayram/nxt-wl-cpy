# Node.js image
FROM node:18-alpine

# Çalışma dizini
WORKDIR /app

# Package dosyalarını kopyala
COPY package.json package-lock.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm dosyaları kopyala
COPY . .

# Uygulamayı build et
RUN npm run build

# Port aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"] 