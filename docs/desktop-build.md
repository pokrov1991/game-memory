# Desktop Build

Desktop-сборка работает через Electron, `electron-vite` и `electron-builder`.

## Команды

```bash
npm run dev:desktop
npm run build:desktop
npm run dist:desktop
```

- `dev:desktop` запускает Electron в dev-режиме и поднимает Vite renderer dev server.
- `build:desktop` собирает Electron main/preload и renderer в `electron/out/`.
- `dist:desktop` сначала выполняет `build:desktop`, затем запускает `electron-builder`.

Web-сборки остаются отдельными:

```bash
npm run build:local
npm run build:yandex
```

## Структура

- `electron/main.ts` - создание `BrowserWindow`, загрузка dev server или production `index.html`, fullscreen toggle по `F11`.
- `electron/preload.ts` - безопасный `contextBridge` API.
- `electron.vite.config.ts` - отдельная Electron-конфигурация сборки.
- `electron/out/main` - собранный main process.
- `electron/out/preload` - собранный preload.
- `electron/out/renderer` - собранный React/Vite renderer.
- `electron/build` - build resources для `electron-builder`.
- `electron/release/desktop` - output директория `electron-builder`.

## PlatformApi

Desktop использует `VITE_PLATFORM_API=desktop`.

`DesktopPlatformApi` наследует локальный адаптер, поэтому:

- Yandex SDK не используется;
- прогресс и настройки сохраняются локально через тот же storage-слой, что и `local`;
- реклама отключена;
- мобильный orientation guard не применяется.

Preload сейчас публикует минимальный API:

```ts
window.desktopApi.platform
window.desktopApi.versions
```

Этот API можно расширить позже для файловой системы, импортов/экспортов сохранений и системных интеграций. Доступ к Node.js из renderer отключен.

## Роутинг

Приложение использует `createHashRouter`, поэтому production-загрузка через `file://.../electron/out/renderer/index.html` не ломает маршруты после обновления страницы или прямого перехода.

## Fullscreen

Окно стартует в windowed-режиме. Переключение fullscreen доступно через `F11`; системная поддержка fullscreen включена через `fullscreenable`.

## Иконки

Перед релизом нужно добавить production-иконки в `electron/build/` или явно прописать пути в `package.json` в секциях `build.mac`, `build.win`, `build.linux`.

Рекомендуемые файлы:

- `electron/build/icon.icns` для macOS
- `electron/build/icon.ico` для Windows
- `electron/build/icon.png` для Linux

В `electron/build/icons/README.md` оставлена памятка. Сейчас иконки не настроены и будут использоваться дефолтные иконки Electron/electron-builder.

## Упаковка

`electron-builder` настроен в `package.json`:

- `appId`: `com.orion7.game`
- `productName`: `Orion-7`
- output: `electron/release/desktop`
- macOS targets: `dmg`, `zip`
- Windows targets: `nsis`, `portable`
- Linux targets: `AppImage`, `deb`

На практике сборка пакетов для чужих ОС может требовать дополнительные системные зависимости: Wine для Windows targets на macOS/Linux, Linux tooling для deb/AppImage, сертификаты для code signing macOS/Windows.

## Известные ограничения

- Сохранения пока остаются в browser `localStorage` внутри Electron renderer. Для надежных desktop-сохранений лучше позже расширить `preload` и хранить данные через main process в userData.
- PvP в desktop сейчас наследует web/local поведение. Если нужен отдельный offline/desktop PvP, его нужно вынести в `PlatformApi`.
- Иконки и code signing не настроены.
- Сборка может показывать существующие warnings по CSS nesting и unresolved public asset paths; они не блокируют build.
