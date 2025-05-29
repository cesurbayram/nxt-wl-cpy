# WatchLog Docker Deployment

Bu dosya WatchLog uygulamasını Docker ile nasıl çalıştıracağınızı açıklar.

## Gereksinimler

- Docker
- Docker Compose

## Hızlı Başlangıç

### 1. Environment Variables Ayarlama

Önce environment variables dosyası oluşturun:

```bash
# .env dosyası oluşturun
cp .env.example .env
```

`.env` dosyasını düzenleyerek gerekli değerleri ayarlayın:

```env
# Database Configuration
USER=watchlog_user
HOST=postgres
DATABASE=watchlog
PASSWORD=watchlog_password

# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Secret (production'da güçlü bir secret kullanın)
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2. Docker Compose ile Çalıştırma

```bash
# Uygulamayı build edin ve çalıştırın
docker-compose up --build

# Arka planda çalıştırmak için
docker-compose up -d --build
```

### 3. Erişim

- **Uygulama**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Sadece Dockerfile Kullanma

Eğer sadece Dockerfile kullanmak istiyorsanız:

```bash
# Image'ı build edin
docker build -t watchlog-app .

# Container'ı çalıştırın (PostgreSQL'in ayrıca çalışıyor olması gerekir)
docker run -p 3000:3000 \
  -e USER=your_db_user \
  -e HOST=your_db_host \
  -e DATABASE=your_db_name \
  -e PASSWORD=your_db_password \
  watchlog-app
```

## Production Deployment

Production ortamında:

1. **Güvenlik**: Güçlü şifreler ve JWT secret kullanın
2. **SSL**: Reverse proxy (nginx) ile SSL sertifikası ekleyin
3. **Backup**: PostgreSQL veritabanı için düzenli backup alın
4. **Monitoring**: Container'ları izlemek için monitoring araçları kullanın

### Production Docker Compose Örneği

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: watchlog
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - watchlog-network

  app:
    build: .
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - USER=${DB_USER}
      - HOST=postgres
      - DATABASE=watchlog
      - PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - watchlog-network

volumes:
  postgres_data:

networks:
  watchlog-network:
```

## Troubleshooting

### Container'ları kontrol etme

```bash
# Çalışan container'ları görme
docker ps

# Log'ları görme
docker-compose logs app
docker-compose logs postgres

# Container'a bağlanma
docker exec -it watchlog-app sh
docker exec -it watchlog-postgres psql -U watchlog_user -d watchlog
```

### Veritabanı bağlantı sorunları

- PostgreSQL container'ının çalıştığından emin olun
- Environment variables'ların doğru olduğunu kontrol edin
- Network bağlantısını kontrol edin

### Build sorunları

- Node.js versiyonunu kontrol edin
- Dependencies'lerin güncel olduğundan emin olun
- Cache'i temizleyin: `docker system prune -a`

## Komutlar

```bash
# Tüm servisleri başlat
docker-compose up

# Sadece build et
docker-compose build

# Servisleri durdur
docker-compose down

# Volume'ları da sil
docker-compose down -v

# Log'ları takip et
docker-compose logs -f app
```
