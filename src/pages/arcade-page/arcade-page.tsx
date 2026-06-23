import { useEffect } from 'react'
import { Layout, Navigate } from '@/shared/components'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { Button } from '@/shared/components'
import { LEVELS_STORE_CONFIG } from '@/shared/constants'
import { platformApi } from '@/shared/services/platform'
import styles from './styles.module.css'

const routes = [
  {
    path: '/',
    name: 'Назад',
    sort: 30,
  },
  {
    path: '/leader-board',
    name: 'Лидерборд',
    sort: 20,
  },
  {
    path: '/arcade',
    name: 'Быстрая игра',
    sort: 10,
  },
]

export const ArcadePage = () => {
  const navigate = useNavigate()
  const { selectLevelArcade } = useProgress()
  const { user, setUser, setGame } = useUser()

  const handleClickLevel = () => {
    if (user.isAuthorized) {
      selectLevelArcade(1)
      navigate('/game')
    } else {
      platformApi.authUser().then((res) => {
        setUser(res.user)
        setGame(res.game)
      })
    }
  }

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboard = await platformApi.getLeaderboard('orionBoard')
      console.log('leaderboard', leaderboard)
    }

    fetchLeaderboard()
  }, [])

  return (
    <main className={styles['arcade-page']}>
      <Layout title="Таблица лидеров">
        <div className={styles.container}>
          <div className={styles.navigation}>
            <Navigate routes={routes} />
          </div>
          <div className={styles['arcade-page-content']}>
            <h1 className={styles['arcade-page-title']}>Режим аркады</h1>
            <p className={styles['arcade-page-info']}>
              Аркадный режим для настоящих рекордсменов! Проходите уровни с меняющейся сложностью, открывайте карты и зарабатывайте очки за правильные и быстрые решения. Ставьте новые рекорды и поднимайтесь выше в таблице лидеров.
            </p>
            <Button onClick={handleClickLevel}>
              Играть
            </Button>
            <h2 className={styles['arcade-page-title']}>Быстрая игра</h2>
            <p className={styles['arcade-page-info']}>
              Проходите уровни в удобном для вас темпе. Выбирайте любой уровень, тренируйте свои навыки и улучшайте результаты. Такая тренировка помогает постепенно освоить игру.
            </p>
            <div className={styles['arcade-page-list']}>
              {LEVELS_STORE_CONFIG.map((level) => {
                return (
                <div className={styles['arcade-page-list-item']} onClick={() => {
                  selectLevelArcade(level.id)
                  navigate('/game', { state: {levelId: level.id}})
                }} key={level.id}>
                  <b>Карт: {level.cardCount}</b>
                  <span>Время: {level.gameTimer} сек.</span>
                </div>)
              })}
            </div>
          </div>
        </div>
      </Layout>
    </main>
  )
}
