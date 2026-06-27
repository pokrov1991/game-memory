import { useEffect, useState } from 'react'
import { orientationService, OrientationGuardState } from '@/shared/services/orientation'

export const useOrientationGuard = (): OrientationGuardState => {
  const [state, setState] = useState<OrientationGuardState>(() => orientationService.getState())

  useEffect(() => {
    setState(orientationService.getState())

    return orientationService.subscribe(setState)
  }, [])

  return state
}
