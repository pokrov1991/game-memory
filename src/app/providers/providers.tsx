import { ErrorBoundary, OrientationOverlay } from '@/shared/components'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from '@/app/styles'
import { StoreProvider } from './store-provider'
import { AudioProvider } from './audio-provider'

export const Providers = ({ children }: { children: JSX.Element }) => (
  <ErrorBoundary fallback={<>Something wrong</>}>
    <StoreProvider>
      <AudioProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <OrientationOverlay />
          {children}
        </ThemeProvider>
      </AudioProvider>
    </StoreProvider>
  </ErrorBoundary>
)
