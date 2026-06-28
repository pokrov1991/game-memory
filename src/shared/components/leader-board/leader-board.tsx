import React, { useEffect, useState } from 'react'
import { LeaderboardEntries, LeaderboardEntry, platformApi } from '@/shared/services/platform'
import { Spinner } from '@/shared/components'
import { useI18n } from '@/shared/services/i18n'
import { LeaderBoardItem } from './leader-board-item'
import styles from './styles.module.css'

export const LeaderBoard: React.FC = () => {
  const { t } = useI18n()
  const [data, setData] = useState<LeaderboardEntries>()
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboardEntries = async () => {
      const dataFetch = await platformApi.getLeaderboardEntries('orionBoard', {
        quantityTop: 10,
        includeUser: true,
        quantityAround: 3
      })
      setData((dataFetch))
      setLoading(false)
    }

    fetchLeaderboardEntries()
  }, [])

  return (
    <div className={styles['leader-board']}>
      {isLoading && (
        <div className={styles['leader-board__loading']}>
          <Spinner />
        </div>
      )}
      {!isLoading && !data.entries.length && (
        <div className={styles['leader-board__empty']}>
          {t('leaderboard.empty')}
        </div>
      )}
      {!isLoading &&
        data.entries.map((props: LeaderboardEntry, index) => (
          <LeaderBoardItem key={index} {...props} />
        ))}
    </div>
  )
}
