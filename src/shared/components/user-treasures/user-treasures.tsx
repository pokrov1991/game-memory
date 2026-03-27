import classNames from 'classnames'
import { useProgress } from '@/shared/hooks'
import styles from './styles.module.css'

export const UserTreasures = () => {
  const { userLevel, userCoins, userPotions, userOrgans } = useProgress()

  return (
    <div className={styles['user-treasures']}>
      <div className={styles['user-treasures__player']}>
        <div className={styles['user-treasures__player-head']}></div>
        <div className={styles['user-treasures__player-body']}></div>
        <div className={styles['user-treasures__player-arm']}></div>
      </div>
      <div className={styles['user-treasures__info']}>
        <div className={classNames(styles['user-treasures__info-item'], styles['user-treasures__info-item_level'])}>
          {userLevel}
        </div>
        <div className={classNames(styles['user-treasures__info-item'], styles['user-treasures__info-item_coin'])}>
          {userCoins}
        </div>
        <div className={classNames(styles['user-treasures__info-item'], styles['user-treasures__info-item_potion'])}>
          {userPotions}
        </div>
        {Object.values(userOrgans).map((item, key) => <div title={item.name} key={key} className={classNames(styles['user-treasures__info-item'], styles[`user-treasures__info-item_${key}`])}>
          {item.count}
        </div>)}
      </div>
    </div>
  )
}
