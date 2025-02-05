import { useMusic, useProgress } from '@/shared/hooks'
import bgUrl from '@/assets/bg.png'
import styles from './styles.module.css'
import { UserInfo } from '@/shared/components/user-info/user-info'
import { Experience } from '@/shared/components/experience/experience'
import { Navigation } from '@/shared/components/navigation/navigation'
import { useUser } from '@/shared/contexts/UserContext'

const ControlPanel = () => <UserInfo />

const AuthControlPanel = () => {
  return (
    <>
      <Experience />
      <UserInfo />
    </>
  )
}

export const MainPage = () => {
  const { user } = useUser();
  const isAuth = user !== null && user.mode !== 'lite';

  const musicButton = useMusic({
    src: '/music/theme.mp3',
    loop: true,
    ui: true,
  })

  return (
    <div className={styles.root}>
      <div className={styles.music}>{musicButton}</div>
      <div className={styles.menu}>
        <Navigation />
      </div>
      <div className={styles.info}>
        {isAuth ? <AuthControlPanel /> : <ControlPanel />}
      </div>
      <img src={bgUrl} className={styles.bg} />
    </div>
  )
}
