import { useEffect, useState } from 'react'
import { Container } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../error-boundary/error-boundary'
// import { Fullscreen } from '../fullscreen/fullscreen'
import { LoadingScreen } from '../loading-screen/loading-screen'
import { MusicTheme } from '../music-theme/music-theme'
import { preloadAssets } from '../../../utils/preloadAssets'
import { useMusic, useAudio } from '@/shared/hooks'

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
  const { unlockAudio } = useAudio()
  const location = useLocation()
  const pagesWithMainTheme = ['/', '/intro', '/levels']

  console.log('Current location:', location.pathname) // Логируем текущий путь и состояние

  useMusic({
    src: './music/theme.mp3',
    loop: true,
    type: 'theme',
    conditional: pagesWithMainTheme.includes(location.pathname) || location.key === 'default',
  })

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
      <Container disableGutters maxWidth={false} onClick={unlockAudio}>
        
        {!isReady && (
          <LoadingScreen progress={progress} error={error} />
        )}

        {isReady && <Outlet />}

        {/* <Fullscreen /> */}
        <MusicTheme />

      </Container>
    </ErrorBoundary>
  )
}
