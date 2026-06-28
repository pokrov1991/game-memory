import ReactDOM from 'react-dom/client'
import { Routes } from './routes'
import { Providers } from './providers'
import { UserProvider } from '../../src/shared/contexts/UserContext'
import { I18nProvider } from '@/shared/services/i18n'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Providers>
    <UserProvider>
      <I18nProvider>
        <Routes />
      </I18nProvider>
    </UserProvider>
  </Providers>
)
