import { useProgress } from '@/shared/hooks'
import styles from './styles.module.css'

export const UserTreasures = () => {
  const { userCoins, userPotions, userOrgans } = useProgress()

  return (
    <div className={styles['user-treasures']}>
      <div className={styles['user-treasures__player']}>
        <div className={styles['user-treasures__player-head']}></div>
        <div className={styles['user-treasures__player-body']}></div>
        <div className={styles['user-treasures__player-arm']}></div>
      </div>
      <div className={styles['user-treasures__info']}>
        <span>
          Монеты: {userCoins},
        </span>
        <span>
          Зелья: {userPotions},
        </span>
        <span>
          Органы: {Object.values(userOrgans).map(item => `${item.name}: ${item.count}`).join(', ')}
        </span>
      </div>
    </div>
  )
}
