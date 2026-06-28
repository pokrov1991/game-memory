import { useEffect } from 'react'
import { Layout, Navigate } from '@/shared/components'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import { Button } from '@/shared/components'
import { LEVELS_STORE_CONFIG } from '@/shared/constants'
import { platformApi } from '@/shared/services/platform'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

export const ArcadePage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { selectLevelArcade } = useProgress()
  const { user, setUser, setGame } = useUser()
  const routes = [
    {
      path: '/',
      name: t('common.back'),
      sort: 30,
    },
    {
      path: '/leader-board',
      name: t('leaderboard.nav'),
      sort: 20,
    },
    {
      path: '/arcade',
      name: t('mainMenu.quickGame'),
      sort: 10,
    },
  ]

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
      <Layout title={t('leaderboard.title')}>
        <div className={styles.container}>
          <div className={styles.navigation}>
            <Navigate routes={routes} />
          </div>
          <div className={styles['arcade-page-content']}>
            <h1 className={styles['arcade-page-title']}>{t('arcade.title')}</h1>
            <p className={styles['arcade-page-info']}>
              {t('arcade.description')}
            </p>
            <Button onClick={handleClickLevel}>
              {t('common.play')}
            </Button>
            <h2 className={styles['arcade-page-title']}>{t('arcade.quickTitle')}</h2>
            <p className={styles['arcade-page-info']}>
              {t('arcade.quickDescription')}
            </p>
            <div className={styles['arcade-page-list']}>
              {LEVELS_STORE_CONFIG.map((level) => {
                return (
                <div className={styles['arcade-page-list-item']} onClick={() => {
                  selectLevelArcade(level.id)
                  navigate('/game', { state: {levelId: level.id}})
                }} key={level.id}>
                  <b>{t('common.cards')}: {level.cardCount}</b>
                  <span>{t('common.time')}: {level.gameTimer} {t('common.seconds')}.</span>
                </div>)
              })}
            </div>
          </div>
        </div>
      </Layout>
    </main>
  )
}
