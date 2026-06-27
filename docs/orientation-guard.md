# Orientation Guard

Orientation guard включен только для `VITE_PLATFORM_API=local`. В `yandex` используется noop-стратегия, поэтому overlay не показывается и listeners не добавляются.

## Определение устройства

Единая точка определения устройства находится в `src/shared/utils/device.ts`.

- `phone` определяется для touch-устройств с мобильным user agent или короткой стороной экрана до `767px`.
- `tablet` определяется для touch-устройств с tablet user agent или с длинной стороной до `1366px`, если устройство не попало в `phone`.
- `desktop` используется для устройств без touch input или экранов, которые не подходят под phone/tablet heuristics.

Проверки не дублируются по компонентам. Для нового кода нужно использовать `getDeviceClass()`, `isPhone()` или `isTablet()`.

## Требуемая ориентация

- `phone`: только `portrait`.
- `tablet`: только `landscape`.
- `desktop`: ограничений нет.

Текущая ориентация определяется в `WebOrientationStrategy` через `window.matchMedia('(orientation: portrait)')`, `window.matchMedia('(orientation: landscape)')` и fallback на сравнение `window.innerWidth` / `window.innerHeight`.

Стратегия подписывается на `orientationchange` и `resize`, а при размонтировании hook удаляет listeners через unsubscribe.

## Архитектура

UI находится в `OrientationOverlay` и подключен высоко в дереве приложения через `Providers`, поэтому перекрывает страницы и модалки.

Компонент не знает о платформе и устройстве напрямую. Он использует `useOrientationGuard()`, который возвращает:

```ts
{
  shouldBlock,
  expectedOrientation
}
```

Сервисный слой находится в `src/shared/services/orientation`:

- `OrientationService` - общий facade для UI и hooks.
- `WebOrientationStrategy` - текущая web-реализация для local-сборки.
- `NoopOrientationStrategy` - отключение функционала для yandex.

## Подключение нативной блокировки

Чтобы добавить нативную блокировку ориентации для мобильной сборки без изменения UI:

1. Создать новую стратегию, например `NativeOrientationStrategy`, с тем же интерфейсом `OrientationStrategy`.
2. Внутри стратегии использовать Capacitor Screen Orientation, Cordova, Android Activity или iOS Orientation API.
3. Изменить выбор стратегии в `createOrientationStrategy()` внутри `orientationService.ts`.
4. Оставить `OrientationOverlay` и `useOrientationGuard()` без изменений.

Если нативная стратегия полностью блокирует поворот на уровне платформы, она может возвращать `shouldBlock: false`. Если нативная блокировка недоступна или не сработала, стратегия может сохранить web fallback и продолжить показывать overlay.
