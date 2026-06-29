import { DesktopPlatformApi } from './adapters/desktopPlatform'
import { LocalPlatformApi } from './adapters/localPlatform'
import { YandexPlatformApi } from './adapters/yandexPlatform'
import { PlatformApi, PlatformApiKind } from './types'

const isPlatformApiKind = (value: string | undefined): value is PlatformApiKind => {
  return value === 'yandex' || value === 'local' || value === 'desktop'
}

const createExplicitPlatformApi = (platform: PlatformApiKind): PlatformApi => {
  if (platform === 'yandex') return new YandexPlatformApi()
  if (platform === 'desktop') return new DesktopPlatformApi()

  return new LocalPlatformApi()
}

export const createPlatformApi = (): PlatformApi => {
  const platform = import.meta.env.VITE_PLATFORM_API

  if (isPlatformApiKind(platform)) {
    return createExplicitPlatformApi(platform)
  }

  return typeof window !== 'undefined' && window.YaGames
    ? new YandexPlatformApi()
    : new LocalPlatformApi()
}
