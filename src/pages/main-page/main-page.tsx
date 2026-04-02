import bgUrl from '/ui/bg.png'
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

  return (
    <div className={styles['main-page']}>
      <div className={styles['main-page__menu']}>
        <Navigation />
      </div>
      <div className={styles['main-page__info']}>
        {isAuth ? <AuthControlPanel /> : <ControlPanel />}
      </div>
      <img src={bgUrl} className={styles['main-page__bg']} />
    </div>
  )
}
