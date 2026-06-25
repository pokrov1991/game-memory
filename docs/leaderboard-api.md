# API лидерборда

Базовый путь: `/api/leaderboard`.

Ответы используют ту же структуру, что и `PlatformApi.getLeaderboardEntries`.

## GET `/api/leaderboard/:leaderboardName`

Возвращает метаданные лидерборда.

Пример:

```bash
curl http://localhost:8080/api/leaderboard/orionBoard
```

Ответ:

```json
{
  "name": "orionBoard",
  "title": "orionBoard"
}
```

## GET `/api/leaderboard/top`

Возвращает топ записей. Этот endpoint используется в `LocalPlatformApi`.

Query params:

- `leaderboardName` - идентификатор лидерборда, по умолчанию `orionBoard`.
- `quantityTop` или `limit` - количество записей в топе, по умолчанию `10`, максимум `100`.
- `playerId` - опциональный id текущего игрока для `userRank`.
- `includeUser=true` - добавить записи вокруг текущего игрока.
- `quantityAround` - количество соседних позиций вокруг текущего игрока, максимум `100`.

Пример:

```bash
curl "http://localhost:8080/api/leaderboard/top?leaderboardName=orionBoard&quantityTop=10&playerId=local-player"
```

Ответ:

```json
{
  "leaderboard": {
    "name": "orionBoard",
    "title": "orionBoard"
  },
  "ranges": [
    {
      "start": 0,
      "size": 1
    }
  ],
  "userRank": 1,
  "entries": [
    {
      "rank": 1,
      "score": 1200,
      "extraData": "3",
      "player": {
        "id": "local-player",
        "name": "Игрок",
        "avatar": ""
      }
    }
  ]
}
```

## GET `/api/leaderboard/:leaderboardName/entries`

Альтернативный endpoint для получения топа записей.

Query params:

- `quantityTop` или `limit` - количество записей в топе, по умолчанию `10`, максимум `100`.
- `playerId` - опциональный id текущего игрока для `userRank`.
- `includeUser=true` - добавить записи вокруг текущего игрока.
- `quantityAround` - количество соседних позиций вокруг текущего игрока, максимум `100`.

Пример:

```bash
curl "http://localhost:8080/api/leaderboard/orionBoard/entries?quantityTop=10"
```

## GET `/api/leaderboard/player-name`

Проверяет, свободно ли имя игрока среди записей локального лидерборда.

Query params:

- `name` - проверяемое имя игрока.
- `playerId` - текущий игрок, которого нужно исключить из проверки.

Пример:

```bash
curl "http://localhost:8080/api/leaderboard/player-name?name=Alex&playerId=local-player-id"
```

Ответ:

```json
{
  "available": true
}
```

## POST `/api/leaderboard/score`

Отправляет score игрока. Backend хранит лучший score для каждой пары `(leaderboardName, playerId)`. В local-сборке `playerId` берется из профиля `orion7:local-player:v1`, поэтому разные local-игроки записываются отдельными строками.

Тело запроса:

```json
{
  "leaderboardName": "orionBoard",
  "playerId": "local-player",
  "playerName": "Игрок",
  "avatar": "",
  "score": 1200,
  "extraData": "3"
}
```

Валидация:

- `leaderboardName`: `a-z`, `A-Z`, `0-9`, `_`, `-`, максимум 64 символа.
- `playerId`: непустая строка, максимум 128 символов.
- `playerName`: непустая строка, максимум 32 символа.
- `score`: целое число от `0` до `100000000`.
- `extraData`: опциональная строка, максимум 512 символов.

Пример:

```bash
curl -X POST http://localhost:8080/api/leaderboard/score \
  -H "Content-Type: application/json" \
  -d '{"leaderboardName":"orionBoard","playerId":"local-player","playerName":"Игрок","score":1200,"extraData":"3"}'
```

Ответ:

```json
{
  "leaderboard": {
    "name": "orionBoard",
    "title": "orionBoard"
  },
  "userRank": 1
}
```

## Ошибки

Некорректный запрос:

```json
{
  "error": "bad_request",
  "message": "score must be an integer from 0 to 100000000"
}
```

Rate limit:

```json
{
  "error": "rate_limited",
  "message": "Too many score submissions"
}
```

Внутренняя ошибка:

```json
{
  "error": "internal_error",
  "message": "DATABASE_URL is required for leaderboard API"
}
```
