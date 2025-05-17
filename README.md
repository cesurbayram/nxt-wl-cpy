This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# WatchLog

WatchLog, robot kontrolcülerini izleme ve yönetme uygulamasıdır.

## Docker Kurulumu

WatchLog uygulamasını Docker kullanarak hızlıca kurabilirsiniz.

### Ön Koşullar

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Kurulum ve Çalıştırma

1. Projeyi klonlayın veya indirin
2. Proje dizinine gidin
3. Docker Compose ile uygulamayı çalıştırın:

```bash
# Uygulamayı arka planda çalıştırma
docker-compose up -d

# Logları görüntüleme
docker-compose logs -f
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

### Ortam Değişkenleri

Docker Compose yapılandırmasını kullanmadan önce `docker-compose.yml` dosyasındaki şu değişkenleri güncellemeniz önerilir:

- `SECRET`: JWT için kullanılan gizli anahtar
- `POSTGRES_PASSWORD`: PostgreSQL veritabanı şifresi

### Veritabanı Yönetimi

Veritabanı verileri Docker volume ile saklanır. Veritabanını sıfırlamak isterseniz:

```bash
# Uygulamayı durdur
docker-compose down

# Volume'ü sil
docker volume rm wl-kopya_postgres_data

# Uygulamayı tekrar başlat
docker-compose up -d
```

## Geliştirme Ortamı

Geliştirme için yerel ortamınızda:

```bash
# Bağımlılıkları yükleme
npm install

# Geliştirme sunucusunu başlatma
npm run dev
```

## Lisans Yönetimi

WatchLog, 45 günlük lisans sistemi ile çalışır. Lisans anahtarı oluşturmak için:

1. `/admin/license-generator` sayfasına gidin
2. Admin anahtarını girin
3. Lisans süresini seçin ve anahtarı oluşturun

Kullanıcılar, oluşturulan lisans anahtarını `/license` sayfasından etkinleştirebilirler.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
