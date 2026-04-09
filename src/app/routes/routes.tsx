import { createHashRouter, RouterProvider } from 'react-router-dom'
import { routesConfig } from './routesConfig'

const router = createHashRouter(routesConfig)

export const Routes = () => <RouterProvider router={router} />
