import { Button } from '@/shared'
import styles from './styles.module.css'

const bgUrl = './ui/500.png'

export const NotFoundPage = () => (
  <div className={styles.bg} style={{ backgroundImage: `url(${bgUrl})` }}>
    <Button href="/">Меню</Button>
  </div>
)
