# Steam build

STEAM_LOGIN=pokrov1991
STEAM_APP_ID=4927190
MAC_DEPOT_ID=4927191

Steam-сборка использует отдельный режим платформенного слоя:

```bash
VITE_PLATFORM_API=steam
```

Команды:

```bash
npm run dev:steam
npm run build:steam
npm run dist:steam
npm run deploy:steam
```

`build:steam` собирает Electron-приложение через `electron-vite`. Renderer выбирает `SteamPlatformApi`, Yandex SDK не загружается, реклама отключена через no-op `showAd()`.

`dist:steam` дополнительно упаковывает приложение через `electron-builder --config electron-builder.steam.json` в:

```txt
electron/release/steam
```

Нативные файлы `steamworks.js` распаковываются в `app.asar.unpacked`, чтобы Steamworks `.node` и `steam_api` runtime могли загрузиться из packaged app.

`deploy:steam` выполняет `dist:steam`, затем загружает build через SteamCMD:

```bash
steamcmd +login pokrov1991 +run_app_build "$(pwd)/steamworks/scripts/app_build_4927190.vdf" +quit
```

## Steamworks SDK

Steam runtime находится за Electron bridge:

- main/preload: `electron/steam.ts`, `electron/main.ts`, `electron/preload.ts`
- renderer adapter: `src/shared/services/platform/adapters/steamPlatform.ts`

Renderer не импортирует Steamworks SDK напрямую и обращается только к `window.steamApi`. Это защищает web/yandex/local сборки от попадания нативного Steam SDK в bundle.

Для реального Steam runtime нужно установить совместимый Node/Electron wrapper, например `steamworks.js`, и запускать приложение из Steam или с корректным Steam App ID:

```bash
STEAM_APP_ID=000000 npm run dev:steam
```

Если `steamworks.js` или Steam API недоступны, приложение не падает: Steam adapter пишет ошибку в консоль и использует локальный fallback для прогресса, достижений и статистики.

## Steam Cloud

Прогресс сохраняется через `PlatformApi.saveProgress()` / `setGameData()` в файл Steam Remote Storage:

```txt
orion7-save.json
```

Формат сохранения не меняется: используется существующий `GameProgress`. Если cloud-файл отсутствует, возвращается `createDefaultGameProgress()`. При ошибках чтения или записи adapter логирует ошибку и использует безопасный fallback.

## Achievements

Имена достижений лежат в:

```txt
src/shared/services/platform/config.ts
```

Пример:

```ts
ACHIEVEMENTS.FIRST_WIN
```

Разблокировка идет через:

```ts
await platformApi.unlockAchievement(ACHIEVEMENTS.FIRST_WIN)
```

Для local/desktop fallback достижения хранятся в `localStorage`. Для yandex методы являются no-op.

## Stats

Имена статистики также лежат в `src/shared/services/platform/config.ts`:

```ts
STATS.GAMES_PLAYED
STATS.WINS
```

Методы:

```ts
await platformApi.setStat(STATS.WINS, 1)
await platformApi.incrementStat(STATS.GAMES_PLAYED)
await platformApi.storeStats()
```

В Steam adapter `setStat()` сразу вызывает сохранение stats. Для local/desktop статистика хранится в `localStorage`. Для yandex методы являются no-op.

## Overlay

Steam Overlay доступен через:

```ts
await platformApi.isOverlayAvailable()
await platformApi.openOverlay('friends')
```

В local/yandex/desktop это безопасный no-op.

## SteamPipe

Готовые SteamPipe файлы лежат в:

```txt
steamworks/scripts
```

Текущие upload files:

```txt
steamworks/scripts/app_build_4927190.vdf
steamworks/scripts/depot_build_4927191.vdf
```

Они используют AppID `4927190` и macOS depot `4927191`. `SetLive` оставлен пустым, поэтому после первого upload build нужно назначить на branch вручную в Steamworks.

Текущий macOS build content:

```txt
electron/release/steam/mac-arm64/Orion-7.app
```

Команда upload после подготовки `.vdf`:

```bash
npm run deploy:steam
```

Эквивалентная прямая команда SteamCMD:

```bash
steamcmd +login pokrov1991 +run_app_build "$(pwd)/steamworks/scripts/app_build_4927190.vdf" +quit
```

Пароль и Steam Guard код вводятся интерактивно в SteamCMD. Не сохранять пароль в npm scripts или `.vdf`.

`steam_appid.txt` не нужно грузить в Steam depot. Он нужен только для локального запуска вне Steam.

## Что отключено

В Steam-сборке:

- не загружается Yandex Games SDK;
- не вызывается реклама;
- Yandex leaderboard/player API не используется;
- Steam API инициализируется только через Electron bridge.

## Steamworks Admin checklist

Перед отправкой build в Steam нужно проверить App Admin:

1. Packages / Depots
   - создать depot для macOS;
   - если нужны Windows/Linux, создать отдельные depots и builder scripts для них;
   - заменить `<MAC_DEPOT_ID>` в `steamworks/scripts/*.template`.

2. Installation / Launch Options
   - создать launch option для macOS:
     - Executable: `Orion-7.app`
     - Arguments: оставить пустым
     - OS: `macOS`
     - Description: `Orion-7`
   - launch option должен быть привязан к macOS depot `4927191`;
   - для Windows/Linux launch paths добавить после сборки соответствующих платформ.

3. Achievements
   - создать API names из `src/shared/services/platform/config.ts`:
     - `FIRST_WIN`
     - `FIRST_WIN_STORE`
     - `FIRST_WIN_BATTLE`
     - `FIRST_WIN_PVP`
     - `COMPLETE_TUTORIAL`
     - `COMPLETE_COMPANY`
     - `COMPLETE_STORE`
     - `COMPLETE_INVENTORY`
     - `CNT_PARRY_BATTLE`
     - `CNT_PARRY_PVP`
     - `CNT_ENEMY_DEFEAT_1`
     - `CNT_ENEMY_DEFEAT_3`
     - `CNT_ENEMY_DEFEAT_5`
     - `CNT_COINS`

4. Stats
   - создать stats API names из `src/shared/services/platform/config.ts`:
     - `GAMES_PLAYED`
     - `GAMES_PLAYED_BATTLE`
     - `GAMES_PLAYED_PVP`
     - `WINS`
     - `WINS_BATTLE`
     - `WINS_PVP`
     - `CARDS_MATCHED`
     - `PARRY_BATTLE`
     - `PARRY_PVP`
     - `ENEMY_DEFEAT_1`
     - `ENEMY_DEFEAT_2`
     - `ENEMY_DEFEAT_3`
     - `ENEMY_DEFEAT_4`
     - `ENEMY_DEFEAT_5`
     - `ENEMY_DEFEAT_6`
     - `COINS`

5. Steam Cloud
   - включить Steam Cloud для приложения;
   - выставить user quota и max files;
   - оставить файл сохранения `orion7-save.json`.

6. Store / Release
   - загрузить build через SteamPipe;
   - назначить build на private beta branch;
   - установить игру из Steam клиента и проверить Steam ID, persona name, overlay, achievements, stats и cloud save;
   - только после этого продвигать build на default branch.

macOS release note: текущий local package собирается без Developer ID signing/notarization, если на машине нет сертификата. Для публичной macOS-раздачи через Steam лучше настроить Apple signing/notarization отдельно.


Что осталось сделать перед отправкой в Steam:

1. В Steamworks Admin создать depot ID для macOS, а если нужны Windows/Linux, то отдельные depots для них.
2. Заменить <MAC_DEPOT_ID> в VDF templates внутри steamworks/scripts.
3. В Steamworks Admin завести achievement API names и stat API names точно как в ACHIEVEMENTS и STATS.
4. Включить Steam Cloud для приложения и разрешить файл orion7-save.json.
5. Настроить Launch Options для depots.
6. Загрузить билд через SteamPipe на private/beta branch.
7. Протестировать запуск именно из Steam client, потому что Steam API и overlay нормально проверяются только там.
8. Для публичного macOS-релиза понадобится Developer ID signing/notarization. Сейчас electron-builder собрал macOS app, но signing был пропущен из-за отсутствия сертификата.
