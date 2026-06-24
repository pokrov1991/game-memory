# Деплой

Пароль: jeB946Khi8HqK0OD

## Быстрый деплой

Деплой игры выполняется из корня проекта:

```bash
npm run deploy
```

Эта команда собирает local-версию игры и копирует `dist/` в `/var/www/orion7/dist/` на сервере.

Деплой backend-сервера выполняется из директории `server`:

```bash
cd server
npm run deploy
```

Или из корня проекта:

```bash
npm run server:deploy
```

Эта команда копирует сервер в `/var/www/orion7/server/`, устанавливает production-зависимости, применяет миграции и перезапускает процесс `orion7` через PM2. Если процесса ещё нет, команда создаст его.

## Сборка local-клиента

Из корня проекта:

```bash
npm install
npm run build:local
```

По умолчанию сервер отдаёт собранную игру из `dist`.

## Настройка сервера

Установите зависимости сервера:

```bash
cd server
npm install --omit=dev
cp .env.example .env
```

Пример `.env`:

```env
PORT=8080
DATABASE_URL=postgres://orion7:qazxswEDC123@localhost:5432/orion7
CLIENT_DIST_DIR=../dist
NODE_ENV=production
```

При стандартном деплое `server/.env` лежит в `/var/www/orion7/server/.env`, поэтому `CLIENT_DIST_DIR=../dist` указывает на `/var/www/orion7/dist`.

Указывайте `CORS_ORIGIN=https://orion7.skybug.ru` только если API вызывается с другого домена. Для same-origin деплоя CORS не нужен.

## PostgreSQL

Установить PostgreSQL:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Создайте базу данных и пользователя:

```bash
sudo -u postgres psql
```

```sql
CREATE USER orion7 WITH PASSWORD 'qazxswEDC123';
CREATE DATABASE orion7 OWNER orion7;
\q
```

Примените миграции:

```bash
cd server
npm run migrate
```

## Запуск сервера

```bash
cd server
npm start
```

Ожидаемые маршруты:

- `GET /` отдаёт `dist/index.html`.
- `GET /assets/...` отдаёт собранные assets.
- `WS /ws` обрабатывает PvP.
- `GET /api/leaderboard/top` возвращает записи лидерборда.

## Проверки

Проверить статику игры:

```bash
curl -I http://localhost:8080/
```

Проверить API:

```bash
curl "http://localhost:8080/api/leaderboard/top?leaderboardName=orionBoard&quantityTop=10"
```

Отправить score:

```bash
curl -X POST http://localhost:8080/api/leaderboard/score \
  -H "Content-Type: application/json" \
  -d '{"leaderboardName":"orionBoard","playerId":"local-player","playerName":"Игрок","score":100}'
```

Проверить WebSocket через `wscat`:

```bash
npx wscat -c ws://localhost:8080/ws
```

Затем отправить:

```json
{
  "type": "find_match",
  "playerId": "p1",
  "playerName": "Player 1",
  "locationId": 1,
  "skinId": 1
}
```

## Nginx reverse proxy

Установить:

```bash
sudo apt install nginx
```

Создать конфиг:

```bash
sudo nano /etc/nginx/sites-available/orion7.skybug.ru
```

Минимальный HTTP reverse proxy до выпуска SSL-сертификата:

```nginx
server {
  listen 80;
  server_name orion7.skybug.ru;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /ws {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Включить сайт и проверить конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/orion7.skybug.ru /etc/nginx/sites-enabled/orion7.skybug.ru
sudo nginx -t
sudo systemctl reload nginx
```

Выпустить SSL-сертификат:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d orion7.skybug.ru
```

Итоговый HTTPS-конфиг должен быть таким или эквивалентным. Certbot может сам добавить `ssl_certificate` и `ssl_certificate_key`; главное, чтобы `server_name`, `proxy_pass` и WebSocket headers остались такими:

```nginx
server {
  listen 80;
  server_name orion7.skybug.ru;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name orion7.skybug.ru;

  ssl_certificate /etc/letsencrypt/live/orion7.skybug.ru/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/orion7.skybug.ru/privkey.pem;

  location /ws {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Потом:

```nginx
sudo nginx -t
sudo systemctl restart nginx
```

## systemd

`/etc/systemd/system/orion7.service`:

```ini
[Unit]
Description=Orion7 server
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/var/www/orion7/server
EnvironmentFile=/var/www/orion7/server/.env
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Включить service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable orion7
sudo systemctl start orion7
sudo systemctl status orion7
```

## PM2

```bash
cd server
pm2 start index.js --name orion7
pm2 save
```
