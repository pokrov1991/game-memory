import { useEffect, useState } from 'react'
import { Container } from '@mui/material'
import { Navigate, Outlet } from 'react-router-dom'
import { ErrorBoundary } from '../error-boundary/error-boundary'
import { Fullscreen } from '../fullscreen/fullscreen'
import { LoadingScreen } from '../loading-screen/loading-screen'
import { MusicTheme } from '../music-theme/music-theme'
import { preloadAssets } from '../../../utils/preloadAssets'

declare global {
  interface Window {
    __ASSETS__: any
  }
}

export const App = () => {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState('')
  const [assets, setAssets] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const loadedAssets = await preloadAssets((value) => {
          if (!cancelled) setProgress(value)
        })

        if (!cancelled) {
          setAssets(loadedAssets)
          setIsReady(true)

          // можно сохранить глобально
          window.__ASSETS__ = loadedAssets
        }
      } catch (err) {
        console.error('Boot error:', err)
        
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки')
        }
      }
    }

    boot()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ErrorBoundary 
      fallback={<Navigate to="/error" />}
      onError={(error, info) => {
        console.error('React ErrorBoundary:', error, info)
      }}>
      <Container disableGutters maxWidth={false}>
        
        {!isReady && (
          <LoadingScreen progress={progress} error={error} />
        )}

        {isReady && <Outlet />}

        <Fullscreen />
        <MusicTheme />

      </Container>
    </ErrorBoundary>
  )
}

// export const App = () => {
//   return (
//     <ErrorBoundary fallback={<Navigate to="/error" />}>
//       <Container disableGutters maxWidth={false}>
//         <Outlet />
//         <Fullscreen />
//         <MusicTheme />
//       </Container>
//     </ErrorBoundary>
//   )
// }