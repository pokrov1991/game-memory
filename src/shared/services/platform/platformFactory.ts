import { PlatformApi } from './types'
import { createPlatformApiAdapter } from '@platform-adapter'

export const createPlatformApi = (): PlatformApi => {
  return createPlatformApiAdapter()
}
