import styles from './styles.module.css'

export const StoryPlayer = () => {
  return (
    <div className={styles['story-player']}>
      <div className={styles['story-player__head']}></div>
      <div className={styles['story-player__body']}></div>
      <div className={styles['story-player__arm']}></div>
    </div>
  )
}
