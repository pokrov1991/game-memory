# Platform API Migration Status

## 1. Что уже реализовано

В проект добавлен общий платформенный слой `PlatformApi`, который отделяет игровой код от конкретной платформы.

Реализовано:

- общий интерфейс `PlatformApi`;
- общие типы `PlatformUser`, `GameProgress`, `LeaderboardEntry` и связанные DTO;
- единый `DEFAULT_GAME_PROGRESS`;
- `LocalPlatformApi` для локальной версии Steam / Android / iOS;
- `YandexPlatformApi` для Яндекс Игр;
- `createPlatformApi()` с выбором платформы через `VITE_PLATFORM_API`;
- singleton `platformApi`;
- замена прямых UI-вызовов старого `YandexSDK` на `platformApi`;
- динамическая загрузка Yandex Games SDK внутри `YandexPlatformApi`;
- удаление старых runtime SDK-файлов `src/shared/services/sdk/*`;
- удаление декоратора `ensureYsdk`;
- npm scripts для local/yandex режимов.

Игровая логика, Canvas, PvP/WebSocket и audio не менялись.

## 2. Какие файлы были созданы

Создан платформенный слой:

- `src/shared/services/platform/types.ts`
- `src/shared/services/platform/defaults.ts`
- `src/shared/services/platform/platformStorage.ts`
- `src/shared/services/platform/platformFactory.ts`
- `src/shared/services/platform/platformApi.ts`
- `src/shared/services/platform/index.ts`
- `src/shared/services/platform/adapters/localPlatform.ts`
- `src/shared/services/platform/adapters/yandexPlatform.ts`

Создан этот отчет:

- `docs/platform-migration-status.md`

## 3. Какие файлы были изменены

Изменены инфраструктурные файлы:

- `package.json`
- `index.html`
- `src/vite-env.d.ts`
- `src/shared/slices/progress-slices.ts`

Изменены места, которые раньше напрямую использовали `YandexSDK`:

- `src/shared/contexts/UserContext.tsx`
- `src/shared/components/user-info/user-info.tsx`
- `src/shared/components/xp-manager/xp-manager.tsx`
- `src/shared/components/leader-board/leader-board.tsx`
- `src/shared/components/leader-board/leader-board-item.tsx`
- `src/pages/arcade-page/arcade-page.tsx`
- `src/pages/game-page/game-page.tsx`
- `src/pages/game-battle-page/game-battle-page.tsx`
- `src/pages/game-store-page/game-store-page.tsx`
- `src/pages/tavern-page/tavern-page.tsx`

Удалены старые runtime SDK-файлы:

- `src/shared/services/sdk/yandexSdk.ts`
- `src/shared/services/sdk/sdk.ts`
- `src/shared/decorators/ensureYsdk.ts`

Существующий файл типов `src/types/yandexSdk.d.ts` оставлен, потому что проектное правило запрещает удалять существующие типы. Сейчас эти типы используются только внутри `YandexPlatformApi`.

## 4. Текущая архитектура PlatformApi

Публичный вход в платформенный слой:

- `src/shared/services/platform/index.ts`

Основной singleton:

- `src/shared/services/platform/platformApi.ts`

```ts
export const platformApi = createPlatformApi()
```

Выбор реализации:

- `src/shared/services/platform/platformFactory.ts`

`createPlatformApi()` читает `import.meta.env.VITE_PLATFORM_API`.

Поддерживаемые значения:

- `yandex`
- `local`

Если переменная не задана, используется fallback:

- если есть `window.YaGames`, выбирается `YandexPlatformApi`;
- иначе выбирается `LocalPlatformApi`.

Основной интерфейс:

```ts
interface PlatformApi {
  kind: 'yandex' | 'local'
  init(): Promise<void>
  getUserData(): Promise<PlatformUser>
  authUser(): Promise<PlatformAuthResult>
  getGameData(keys?: unknown): Promise<GameProgress>
  setGameData(data: GameProgress): Promise<void>
  showAd(): Promise<void>
  getLeaderboard(name: string): Promise<LeaderboardDescription | null>
  setLeaderboardScore(name: string, score: number, extraData?: string): Promise<void>
  getLeaderboardEntries(name: string, options: LeaderboardOptions): Promise<LeaderboardEntries>
}
```

## 5. Как работает YandexPlatformApi

Файл:

- `src/shared/services/platform/adapters/yandexPlatform.ts`

`YandexPlatformApi` теперь содержит всю runtime-интеграцию с Яндекс Играми.

Поведение:

- динамически добавляет script `https://yandex.ru/games/sdk/v2`;
- вызывает `window.YaGames.init()`;
- кеширует `ysdk` и `player`;
- `getUserData()` нормализует игрока в `PlatformUser`;
- `authUser()` открывает Yandex auth dialog, если игрок в `lite` mode;
- `getGameData()` читает данные через `player.getData()`;
- если облачные данные пустые, создает `DEFAULT_GAME_PROGRESS` и сохраняет его;
- `setGameData()` сохраняет прогресс через `player.setData()`;
- `showAd()` вызывает `ysdk.adv.showFullscreenAd()`;
- leaderboard-методы используют `ysdk.leaderboards`, но возвращают нормализованные типы платформенного слоя.

Yandex SDK больше не подключается в `index.html`. Подключение происходит только при использовании `YandexPlatformApi`.

## 6. Как работает LocalPlatformApi

Файл:

- `src/shared/services/platform/adapters/localPlatform.ts`

`LocalPlatformApi` предназначен для Steam / Android / iOS локальной версии.

Поведение:

- возвращает локального пользователя:

```ts
{
  id: 'local-player',
  name: 'Игрок',
  avatar: '',
  mode: 'local',
  isAuthorized: true
}
```

- хранит прогресс в `localStorage`;
- ключ хранения: `orion7:game-progress:v1`;
- при отсутствии или повреждении данных использует `DEFAULT_GAME_PROGRESS`;
- `authUser()` является no-op и возвращает локального пользователя с локальным прогрессом;
- `showAd()` является no-op;
- leaderboard-методы являются заглушками и возвращают пустой список результатов.

IndexedDB не внедрен.

## 7. Какие места проекта еще используют старый YandexSDK

Старый `YandexSDK` больше не используется.

По текущему состоянию:

- нет импортов `src/shared/services/sdk/*`;
- нет обращений `YandexSDK.*`;
- нет использования `ensureYsdk`;
- удалены старые runtime SDK-файлы.

Остались только Yandex-специфичные типы:

- `src/types/yandexSdk.d.ts`

Они используются в:

- `src/shared/services/platform/adapters/yandexPlatform.ts`

Это не runtime-зависимость старого SDK, а типизация Yandex adapter.

## 8. Какие этапы миграции уже завершены

Завершено:

1. Создан общий платформенный слой.
2. Созданы типы `PlatformApi`, `PlatformUser`, `LeaderboardEntry`.
3. Вынесены `GameProgress` и `DEFAULT_GAME_PROGRESS`.
4. Создан `LocalPlatformApi`.
5. Создан `YandexPlatformApi`.
6. Создан `createPlatformApi()`.
7. Создан единый экспорт из `platform/index.ts`.
8. Добавлены scripts `dev:yandex`, `dev:local`, `build:yandex`, `build:local`.
9. UI и страницы переведены с прямого `YandexSDK` на `platformApi`.
10. Yandex SDK script удален из `index.html`.
11. Yandex SDK runtime-логика перенесена в `YandexPlatformApi`.
12. Старые runtime SDK-файлы удалены.

## 9. Какие этапы остались

Осталось:

- решить, нужно ли оставить `src/types/yandexSdk.d.ts` в общем `src/types` или перенести Yandex-типы ближе к adapter;
- проверить local runtime вручную в браузере с `npm run dev:local`;
- проверить Yandex runtime вручную с `npm run dev:yandex` или в окружении Яндекс Игр;
- проверить сценарии сохранения прогресса после победы/поражения/магазина/XP в local и yandex режимах;
- определить стратегию хранения для Steam / Android / iOS, если `localStorage` будет недостаточно;
- вынести PvP WebSocket URL в конфиг окружения, если платформы должны использовать разные endpoints;
- добавить smoke-тесты для `LocalPlatformApi` и `createPlatformApi()`;
- убрать старую RTK Query leaderboard-интеграцию, если она действительно не используется.

## 10. Рекомендуемый следующий шаг

Рекомендуемый следующий шаг: выполнить ручную runtime-проверку `dev:local`.

Минимальный сценарий:

1. Запустить `npm run dev:local`.
2. Открыть игру.
3. Убедиться, что пользователь загружается как local user.
4. Пройти действие, которое сохраняет прогресс.
5. Обновить страницу.
6. Убедиться, что прогресс восстановился из `localStorage`.
7. Открыть лидерборд и убедиться, что отображается пустое состояние без ошибок.

После этого аналогично проверить `dev:yandex`.

## 11. Известные риски

Риски:

- `localStorage` может быть очищен пользователем или платформенной оболочкой.
- `localStorage` синхронный и имеет ограничения по объему.
- `YandexPlatformApi` динамически грузит SDK; при сетевой ошибке инициализация yandex режима упадет.
- `authUser()` в Yandex adapter сохраняет прежнее поведение: если игрок уже не в `lite` mode, метод выбрасывает ошибку.
- Leaderboards в local режиме являются заглушками.
- `LeaderBoardItem` теперь использует нормализованное поле `player.avatar`; если avatar пустой, картинка может быть пустой.
- В проекте остаются существующие предупреждения сборки по CSS nesting, MUI `"use client"` и unresolved public asset paths.
- В worktree есть посторонние изменения `dist.zip`, `.DS_Store`, `AGENTS.md`; они не относятся к платформенной миграции.

## 12. Как запускать

Yandex dev:

```bash
npm run dev:yandex
```

Local dev:

```bash
npm run dev:local
```

Yandex build:

```bash
npm run build:yandex
```

Local build:

```bash
npm run build:local
```

Эти scripts устанавливают `VITE_PLATFORM_API`:

- `VITE_PLATFORM_API=yandex`
- `VITE_PLATFORM_API=local`
