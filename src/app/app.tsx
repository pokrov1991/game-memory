import ReactDOM from 'react-dom/client'
import { Routes } from './routes'
import { Providers } from './providers'
import { UserProvider } from '../../src/shared/contexts/UserContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Providers>
    <UserProvider>
      <Routes />
    </UserProvider>
  </Providers>
)

