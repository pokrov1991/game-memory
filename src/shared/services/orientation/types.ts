export type Orientation = 'portrait' | 'landscape'

export type ExpectedOrientation = Orientation | null

export type OrientationGuardState = {
  shouldBlock: boolean
  expectedOrientation: ExpectedOrientation
}

export type OrientationStateListener = (state: OrientationGuardState) => void

export interface OrientationStrategy {
  getState(): OrientationGuardState
  subscribe(listener: OrientationStateListener): () => void
}
