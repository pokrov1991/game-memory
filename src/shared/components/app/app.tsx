import { Container } from '@mui/material'
import { Navigate, Outlet } from 'react-router-dom'
import { ErrorBoundary } from '../error-boundary/error-boundary'
import { Fullscreen } from '../fullscreen/fullscreen'
import { MusicTheme } from '../music-theme/music-theme'

export const App = () => {
  return (
    <ErrorBoundary fallback={<Navigate to="/error" />}>
      <Container disableGutters maxWidth={false}>
        <Outlet />
        <Fullscreen />
        <MusicTheme />
      </Container>
    </ErrorBoundary>
  )
}
