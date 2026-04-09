import { Button } from '@/shared'
import styles from './styles.module.css'

const bgUrl = './ui/500.png'

export const ErrorPage = () => (
  <div className={styles.bg} style={{ backgroundImage: `url(${bgUrl})` }}>
    <Button href="/">Меню</Button>
  </div>
)
