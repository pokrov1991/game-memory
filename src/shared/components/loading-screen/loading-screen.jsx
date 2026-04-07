import styles from './styles.module.css'

export const LoadingScreen = ({ progress, error }) => {
  return (
    <div className={styles['loading-screen']}>
      <div className={styles['loading-box']}>
        <h1 className={styles['loading-title']}>ORION-7</h1>

        <h2 className={styles['loading-pre-title']}>Загрузка игры...</h2>

        <div className={styles['loading-bar']}>
          <div
            className={styles['loading-bar-fill']}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={styles['loading-percent']}>
          {error ? "Ошибка загрузки" : `${progress}%`}
        </div>

        {error && <div className={styles['loading-error']}>{error}</div>}
      </div>
    </div>
  )
}