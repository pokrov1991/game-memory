import { LocalPlatformApi } from './localPlatform'

export class DesktopPlatformApi extends LocalPlatformApi {
  kind = 'desktop' as const

  async showAd(): Promise<void> {}
}
