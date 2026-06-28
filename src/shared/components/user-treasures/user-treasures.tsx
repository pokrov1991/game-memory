import classNames from 'classnames'
import { useProgress } from '@/shared/hooks'
import { StoryPlayer } from '@/shared/components'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

export const UserTreasures = () => {
  const { t } = useI18n()
  const { userLevel, userCoins, userPotions, userOrgans } = useProgress()

  return (
    <div className={styles['user-treasures']}>
      <div className={styles['user-treasures__player']}>
        <StoryPlayer />
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
        {Object.values(userOrgans).map((item, key) => <div title={t(`inventory.organs.${item.id}`)} key={key} className={classNames(styles['user-treasures__info-item'], styles[`user-treasures__info-item_${key}`])}>
          {item.count}
        </div>)}
      </div>
    </div>
  )
}
