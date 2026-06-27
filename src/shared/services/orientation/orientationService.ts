import { platformApi } from '@/shared/services/platform'
import { NoopOrientationStrategy } from './noopOrientationStrategy'
import { OrientationGuardState, OrientationStateListener, OrientationStrategy } from './types'
import { WebOrientationStrategy } from './webOrientationStrategy'

export class OrientationService {
  constructor(private strategy: OrientationStrategy) {}

  getState(): OrientationGuardState {
    return this.strategy.getState()
  }

  subscribe(listener: OrientationStateListener): () => void {
    return this.strategy.subscribe(listener)
  }
}

const createOrientationStrategy = (): OrientationStrategy => {
  if (platformApi.kind !== 'local') {
    return new NoopOrientationStrategy()
  }

  return new WebOrientationStrategy()
}

export const orientationService = new OrientationService(createOrientationStrategy())
