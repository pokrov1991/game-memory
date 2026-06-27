import {
  OrientationGuardState,
  OrientationStateListener,
  OrientationStrategy,
} from './types'

const state: OrientationGuardState = {
  shouldBlock: false,
  expectedOrientation: null,
}

export class NoopOrientationStrategy implements OrientationStrategy {
  getState(): OrientationGuardState {
    return state
  }

  subscribe(_listener: OrientationStateListener): () => void {
    return () => {}
  }
}
