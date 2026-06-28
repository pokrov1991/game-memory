import { Layout, LeaderBoard, Navigate } from '@/shared/components'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

export const LeaderBoardPage = () => {
  const { t } = useI18n()
  const routes = [
    {
      path: '/arcade',
      name: t('common.back'),
      sort: 20,
    },
    {
      path: '/leader-board',
      name: t('leaderboard.nav'),
      sort: 10,
    },
  ]

  return (
    <main className={styles['leader-board-page']}>
      <Layout title={t('leaderboard.title')}>
        <div className={styles.container}>
          <div className={styles.navigation}>
            <Navigate routes={routes} />
          </div>
          <LeaderBoard />
        </div>
      </Layout>
    </main>
  )
}
