# Подключение к Telegram

Mini App должен быть доступен по HTTPS-ссылке. Для теста подойдут Railway, Vercel, Netlify или другой статический хостинг.

## BotFather

1. Открой `@BotFather`.
2. `/mybots`.
3. Выбери нового бота.
4. `Bot Settings` -> `Menu Button`.
5. Укажи HTTPS-ссылку на `index.html`.

## Что дальше подключать

Сейчас это красивый фронтенд-прототип. Чтобы он работал с реальными балансами и сделками, нужен API:

- `GET /api/me`
- `GET /api/deals`
- `POST /api/deals`
- `GET /api/balances`
- `GET /api/transactions`

Текущий `app.js` пока использует демо-данные в памяти браузера.
