import { LocalPlatformApi } from './adapters/localPlatform'
import { YandexPlatformApi } from './adapters/yandexPlatform'
import { PlatformApi, PlatformApiKind } from './types'

const isPlatformApiKind = (value: string | undefined): value is PlatformApiKind => {
  return value === 'yandex' || value === 'local'
}

export const createPlatformApi = (): PlatformApi => {
  const platform = import.meta.env.VITE_PLATFORM_API

  if (isPlatformApiKind(platform)) {
    return platform === 'yandex'
      ? new YandexPlatformApi()
      : new LocalPlatformApi()
  }

  return typeof window !== 'undefined' && window.YaGames
    ? new YandexPlatformApi()
    : new LocalPlatformApi()
}
