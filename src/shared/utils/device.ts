export type DeviceClass = 'phone' | 'tablet' | 'desktop'

const PHONE_MAX_SHORT_SIDE = 767
const TABLET_MAX_LONG_SIDE = 1366

const hasMobileLikeInput = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia('(pointer: coarse)').matches
}

const isMobileUserAgent = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /Android|iPhone|iPod|IEMobile|Windows Phone|Mobile/i.test(navigator.userAgent)
}

const isTabletUserAgent = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent)
}

export const getDeviceClass = (): DeviceClass => {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  const hasMobileUserAgent = isMobileUserAgent()
  const hasTabletUserAgent = isTabletUserAgent()

  if (!hasMobileLikeInput() && !hasMobileUserAgent && !hasTabletUserAgent) {
    return 'desktop'
  }

  const shortSide = Math.min(window.innerWidth, window.innerHeight)
  const longSide = Math.max(window.innerWidth, window.innerHeight)

  if (hasTabletUserAgent) {
    return 'tablet'
  }

  if (hasMobileUserAgent || shortSide <= PHONE_MAX_SHORT_SIDE) {
    return longSide <= TABLET_MAX_LONG_SIDE && shortSide > PHONE_MAX_SHORT_SIDE
      ? 'tablet'
      : 'phone'
  }

  return longSide <= TABLET_MAX_LONG_SIDE ? 'tablet' : 'desktop'
}

export const isPhone = (): boolean => getDeviceClass() === 'phone'

export const isTablet = (): boolean => getDeviceClass() === 'tablet'
