import styles from './styles.module.css'
import { UserInfo } from '@/shared/components/user-info/user-info'
import { Experience } from '@/shared/components/experience/experience'
import { Navigation } from '@/shared/components/navigation/navigation'
import { useUser } from '@/shared/contexts/UserContext'

const bgBefore = './main/bg-before.jpg'
const bgAfter = './main/bg-after.png'
const bgBoy = './main/bg-boy.png'
const bgBoyLight = './main/bg-boy-light.png'
const bgFire = './main/bg-fire.webp'

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
      <div className={styles['main-page__boy']}>
        <img src={bgBoy} className={styles['main-page__bg-boy']} />
        <img src={bgBoyLight} className={styles['main-page__bg-boy-light']} />
        <img src={bgFire} className={styles['main-page__bg-fire']} />
      </div>
      <img src={bgAfter} className={styles['main-page__bg-after']} />
      <img src={bgBefore} className={styles['main-page__bg-before']} />
    </div>
  )
}
