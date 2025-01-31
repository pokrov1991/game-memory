import { App } from '@/shared/components/app'
import { ChooseLevelPage } from '@/pages/choose-level-page/choose-level-page'
import { ErrorPage } from '@/pages/error-page/error-page'
import { GamePage } from '@/pages/game-page/game-page'
import { GamePageBattle } from '@/pages/game-page-battle/game-page-battle'
import { LeaderBoardPage } from '@/pages/leader-board-page/leader-board-page'
import { MainPage } from '@/pages/main-page/main-page'
import { NotFoundPage } from '@/pages/not-found-page/not-found-page'
import { RouteObject } from 'react-router-dom'

export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: '/game',
        Component: GamePage,
      },
      {
        path: '/game-battle',
        Component: GamePageBattle,
      },
      {
        path: '/leader-board',
        Component: LeaderBoardPage,
      },
      {
        path: '/levels',
        Component: ChooseLevelPage,
      },
      {
        path: '/error',
        Component: ErrorPage,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]
