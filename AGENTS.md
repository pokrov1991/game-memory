# Orion-7

## Stack
- React
- TypeScript
- Vite
- Canvas
- Yandex Games SDK
- WebSocket PvP

## Rules
- Не менять игровую логику без запроса.
- Не удалять существующие типы.
- Использовать функциональные React-компоненты.
- Все новые файлы писать на TypeScript.
- Не менять маршрутизацию без необходимости.
- Ковычки используем одинарные. Точка с запятой (;) не используется.

## Platform API Migration

`PlatformApi` введен, чтобы отделить игровой код от API конкретной платформы. Страницы, компоненты и игровая обвязка должны работать через единый платформенный слой, а не напрямую через SDK Яндекс Игр или будущие SDK Steam / Android / iOS.

Существующие реализации:
- `YandexPlatformApi` - адаптер для Яндекс Игр. Он динамически загружает Yandex Games SDK и инкапсулирует все обращения к `window.YaGames`.
- `LocalPlatformApi` - локальная реализация для Steam / Android / iOS. Она хранит прогресс в `localStorage`, возвращает локального пользователя и содержит заглушки лидербордов.

Платформа выбирается через переменную окружения `VITE_PLATFORM_API`:
- `VITE_PLATFORM_API=yandex` - использовать `YandexPlatformApi`.
- `VITE_PLATFORM_API=local` - использовать `LocalPlatformApi`.

Для запуска и сборки использовать npm scripts:
- `npm run dev:yandex`
- `npm run dev:local`
- `npm run build:yandex`
- `npm run build:local`

Правила для нового кода:
- Использовать `platformApi` из `src/shared/services/platform` для пользователя, авторизации, загрузки и сохранения прогресса, рекламы и лидербордов.
- Не добавлять платформенные условия в страницы и игровые компоненты, если это можно решить внутри адаптера `PlatformApi`.
- Не менять структуру `GameProgress` без проверки сохранений обеих платформ.
- Лидерборды в local-режиме пока считать заглушками и не строить на них игровую логику.
- При добавлении новых платформенных возможностей сначала расширять `PlatformApi`, затем реализовывать метод в каждом адаптере.

Запрещено напрямую использовать `YandexSDK`, `window.YaGames` или Yandex Games SDK вне `YandexPlatformApi`. Весь Yandex-specific runtime-код должен оставаться внутри `src/shared/services/platform/adapters/yandexPlatform.ts`.
