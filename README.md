# Avrora — Pinterest-style corporate merch

Next.js 15 (App Router) + TypeScript + Tailwind + Prisma + Postgres + Cloudinary.

## Структура

- `/` — Главная: hero-видео, подборки, посты/реклама, масонри-лента пинов
- `/feed` — Лента: масонри-сетка всех пинов + поиск
- `/profile` — Профиль: вкладки «Вишлист», «Просмотренное», «Нравится»
- `/pin/[id]` — Карточка пина
- `/admin` — Логин админа (пароль из `ADMIN_PASSWORD`)
- `/admin/dashboard` — Админка: добавить пин/пост/подборку/hero-видео

Загрузка медиа идёт напрямую в Cloudinary через signed-upload (подпись выдаёт `/api/admin/upload-sign`).

Сессия пользователя анонимная — cookie `av_sid` хранит sessionId, по нему работают лайки, вишлист и история просмотров.

## Локальный запуск

```bash
cp .env.example .env
# Заполни Cloudinary ключи и ADMIN_PASSWORD.
# DATABASE_URL по умолчанию смотрит на локальный postgres.

# Подними БД (если нет своей):
docker run -d --name avrora-pg -p 5432:5432 \
  -e POSTGRES_USER=avrora -e POSTGRES_PASSWORD=avrora -e POSTGRES_DB=avrora \
  postgres:16-alpine

npm install
npx prisma db push
npm run dev
```

Открой http://localhost:3000 и http://localhost:3000/admin.

## Cloudinary

1. Зарегистрируйся на cloudinary.com, скопируй из Dashboard:
   - Cloud name → `CLOUDINARY_CLOUD_NAME` и `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`
2. Загрузки подписываются на сервере — никаких upload presets настраивать не нужно.

## Деплой на VPS через Docker

На сервере:

```bash
git clone <repo> avrora && cd avrora
cp .env.example .env
# заполни Cloudinary/ADMIN_PASSWORD/SESSION_SECRET
docker compose up -d --build
```

Приложение на :3000, Postgres на :5432 (persistent volume `db_data`).

Перед :80/443 поставь nginx или Caddy как reverse-proxy с TLS.

### Пример Caddyfile

```
avrora.example.com {
  reverse_proxy localhost:3000
}
```

## Стек и решения

- **Next.js App Router**: SSR главных страниц, API routes для админки/сессий
- **Prisma + Postgres**: типобезопасные запросы, миграции через `prisma db push` (для продакшена — `prisma migrate deploy`)
- **Cloudinary**: медиа не хранится на VPS, Cloudinary сам отдаёт оптимизированные версии и поддерживает видео
- **Tailwind + CSS columns**: масонри без JS-зависимостей, стабильнее react-masonry
- **Cookie-сессия без логина**: пользователь получает `av_sid` автоматически → лайки/вишлист работают с первого захода, как в Pinterest
- **Админ один, пароль из env**: минимум кода, подходит под условие «одна админка на всех». HMAC-подписанная cookie.

## Дальше

Когда понадобится, легко добавить:
- Настоящие аккаунты пользователей (NextAuth) — миграция по `sessionId` → `userId`
- Корзина/заказы мерча (новая таблица `Order`, API-роуты, оплата через ЮKassa/Tinkoff)
- Аналитика пинов (таблица `View` уже есть — агрегируй в админке)
- S3/Backblaze вместо Cloudinary, если объёмы перерастут бесплатный тир
