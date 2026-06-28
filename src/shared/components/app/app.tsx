import { useEffect, useState } from 'react'
import { Container } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../error-boundary/error-boundary'
// import { Fullscreen } from '../fullscreen/fullscreen'
import { LoadingScreen } from '../loading-screen/loading-screen'
import { MusicTheme } from '../music-theme/music-theme'
import { preloadAssets } from '../../../utils/preloadAssets'
import { useMusic, useAudio } from '@/shared/hooks'
import { useI18n } from '@/shared/services/i18n'

declare global {
  interface Window {
    __ASSETS__: any
  }
}

export const App = () => {
  const { t } = useI18n()
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState('')
  const [assets, setAssets] = useState(null)
  const { unlockAudio } = useAudio()
  const location = useLocation()
  const pagesMainTheme = ['/', '/levels', '/arcade', '/leader-board', '/pvp']
  const pagesIntroTheme = ['/intro']
  const pagesBattleTheme = ['/game-battle', '/game-pvp']
  const pagesArcadeTheme = ['/game-store', '/game']
  const pagesBaseTheme = ['/base']
  const pagesTavernTheme = ['/tavern']

  const isMainTheme = pagesMainTheme.includes(location.pathname) || location.key === 'default'
  const isIntroTheme = pagesIntroTheme.includes(location.pathname)
  const isBaseTheme = pagesBaseTheme.includes(location.pathname)
  const isTavernTheme = pagesTavernTheme.includes(location.pathname)
  const isBattleTheme = pagesBattleTheme.includes(location.pathname)
  const isArcadeTheme = pagesArcadeTheme.includes(location.pathname)
  const isPlayTheme = isMainTheme || isIntroTheme || isBaseTheme || isTavernTheme || isBattleTheme || isArcadeTheme

  const themeSrc = isBattleTheme
    ? './music/game/theme.mp3'
    : isIntroTheme 
    ? './music/intro/theme.mp3'
    : isTavernTheme
    ? './music/tavern/theme.mp3'
    : isArcadeTheme
    ? './music/arcade/theme.mp3'
    : isBaseTheme 
    ? './music/base/theme.mp3'
    : './music/theme.mp3'

  useMusic({
    src: themeSrc,
    loop: true,
    type: 'theme',
    conditional: isPlayTheme
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
          setError(err instanceof Error ? err.message : t('loading.error'))
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
      <Container disableGutters maxWidth={false} onPointerDownCapture={unlockAudio}>
        
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
