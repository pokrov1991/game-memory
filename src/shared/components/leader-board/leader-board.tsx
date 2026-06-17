import React, { useEffect, useState } from 'react'
import YandexSDK from '@/shared/services/sdk/yandexSdk'
import { ILeaderboardEntries, ILeaderboardEntry } from '@/types';
import { Spinner } from '@/shared/components'
import { LeaderBoardItem } from './leader-board-item'
import styles from './styles.module.css'

export const LeaderBoard: React.FC = () => {
  const [data, setData] = useState<ILeaderboardEntries>()
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboardEntries = async () => {
      const dataFetch = await YandexSDK.getLeaderboardEntries('orionBoard', {
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
          Таблица лидеров пуста!
        </div>
      )}
      {!isLoading &&
        data.entries.map((props: ILeaderboardEntry, index) => (
          <LeaderBoardItem key={index} {...props} />
        ))}
    </div>
  )
}
