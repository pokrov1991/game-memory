import { getDeviceClass } from '@/shared/utils/device'
import {
  ExpectedOrientation,
  Orientation,
  OrientationGuardState,
  OrientationStateListener,
  OrientationStrategy,
} from './types'

const getCurrentOrientation = (): Orientation => {
  if (typeof window === 'undefined') {
    return 'landscape'
  }

  if (window.matchMedia('(orientation: portrait)').matches) {
    return 'portrait'
  }

  if (window.matchMedia('(orientation: landscape)').matches) {
    return 'landscape'
  }

  return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape'
}

const getExpectedOrientation = (): ExpectedOrientation => {
  const deviceClass = getDeviceClass()

  if (deviceClass === 'phone') {
    return 'portrait'
  }

  if (deviceClass === 'tablet') {
    return 'landscape'
  }

  return null
}

export class WebOrientationStrategy implements OrientationStrategy {
  getState(): OrientationGuardState {
    const expectedOrientation = getExpectedOrientation()

    return {
      expectedOrientation,
      shouldBlock: expectedOrientation !== null && getCurrentOrientation() !== expectedOrientation,
    }
  }

  subscribe(listener: OrientationStateListener): () => void {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const notify = () => listener(this.getState())

    window.addEventListener('orientationchange', notify)
    window.addEventListener('resize', notify)

    return () => {
      window.removeEventListener('orientationchange', notify)
      window.removeEventListener('resize', notify)
    }
  }
}
