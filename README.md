# Orion-7

## Основные команды

| Команда | Назначение | Результат |
| --- | --- | --- |
| `npm run dev:yandex` | Запускает web-версию с адаптером Яндекс Игр | Vite dev server |
| `npm run dev:local` | Запускает локальную web-версию без платформенного SDK | Vite dev server |
| `npm run dev:desktop` | Запускает desktop-версию в Electron для разработки | Окно Electron и Vite dev server |
| `npm run dev:steam` | Запускает Electron со Steam-адаптером | Окно Electron со Steam API или локальным fallback |
| `npm run build:yandex` | Собирает web-версию для Яндекс Игр | `dist/` |
| `npm run build:local` | Собирает локальную web-версию | `dist/` |
| `npm run build:desktop` | Компилирует Electron main, preload и renderer без создания установщика | `electron/out/` |
| `npm run dist:desktop` | Собирает desktop-пакеты для текущей операционной системы | `electron/release/desktop/` |
| `npm run build:steam` | Компилирует Electron-версию со Steam-адаптером без упаковки | `electron/out/` |
| `npm run dist:steam:mac` | Собирает распакованную macOS-версию для Steam depot `4927191` | `electron/release/steam/mac-*/Orion-7.app` |
| `npm run dist:steam:windows` | Собирает распакованную Windows-версию для Steam depot `4927192` | `electron/release/steam/win-unpacked/` |
| `npm run deploy:steam:mac` | Собирает macOS Steam-версию и загружает depot через SteamCMD | SteamPipe build без автоматической публикации в branch |
| `npm run deploy:steam:windows` | Собирает Windows Steam-версию и загружает depot через SteamCMD | SteamPipe build без автоматической публикации в branch |

Перед первым запуском необходимо установить зависимости командой `npm install`.

Для Windows-сборки рекомендуется использовать Node.js 22.12 или новее. Обычная desktop-сборка выбирает локальный платформенный адаптер, а команды `steam:*` — Steam-адаптер.

Подробности:

- [Desktop- и Windows-сборка](docs/desktop-build.md)
- [Steam-сборка](docs/steam-build.md)
- [Деплой web-версии](docs/deploy.md)
