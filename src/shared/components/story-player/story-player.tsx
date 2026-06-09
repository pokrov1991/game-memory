import classNames from 'classnames'
import styles from './styles.module.css'

type TStoryPlayer = {
  isAntogonist: boolean
}

export const StoryPlayer = ({
  isAntogonist = false,
}: TStoryPlayer) => {
  return (
    <div className={classNames(
        styles['story-player'], 
        { [styles['story-player_antogonist']]: isAntogonist }
      )}>
      <div className={styles['story-player__head']}></div>
      <div className={styles['story-player__body']}></div>
      <div className={styles['story-player__arm']}></div>
    </div>
  )
}
