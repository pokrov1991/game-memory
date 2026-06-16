import { ReactSVG } from 'react-svg'
import { useProgress } from '@/shared/hooks'
import styles from './styles.module.css'

import { ICONS } from '@/shared/constants/icons'

export const Score = () => {
  const { userScoreArcade } = useProgress()

  return (
    <div className={styles.root}>
      <ReactSVG src={ICONS.Gil} className={styles.icon} />
      <div className={styles.score}>{userScoreArcade}</div>
    </div>
  )
}
