import classNames from 'classnames'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, UserTreasures, ModalDefault } from '@/shared/components'
import { useProgress, useMusic } from '@/shared/hooks'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

type MenuMode = 'main' | 'question1' | 'question2' | 'question3'
type MenuItem = { to: string; titleKey: string; isActive?: boolean }

const imgBarmanDefault = './base/default.webp'
const imgBarmanTalk = './base/talk.webp'

const MENU: Array<MenuItem> = [
  { to: 'question1', titleKey: 'base.menu.where' },
  { to: 'question2', titleKey: 'base.menu.earth' },
  { to: 'question3', titleKey: 'base.menu.danger' },
  { to: '/levels', titleKey: 'common.exit' }
]

export const BasePage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(MENU)
  const [mode, setMode] = useState('main')
  const [talk, setTalk] = useState(false)
  const [blink, setBlink] = useState('(+)     (+)')
  const [isOpenModalInfo, setOpenModalInfo] = useState(false)
  const { selectLevel } = useProgress()
  const scrollRef = useRef(null)

  const soundRobotTalk = useMusic({ src: './music/base/robot-talk.wav', type: 'effect' })

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink('(–)     (–)')

      setTimeout(() => {
        setBlink('(+)     (+)')
      }, 500)

    }, 5000)

    return () => clearInterval(interval)
  }, []);
  
  const handleTraining = () => {
    selectLevel(0)
    navigate('/game-battle', {})
  }

  const scrollUp = () => {
    scrollRef.current.scrollBy({
      top: -64,
      behavior: "smooth"
    })
  }

  const scrollDown = () => {
    scrollRef.current.scrollBy({
      top: 64,
      behavior: "smooth"
    })
  }

  const NavigationItem = ({
    to,
    titleKey,
    isActive = false,
  }: {
    to?: string
    titleKey: string
    isActive?: boolean
  }) => {
    const ACTIONS: Record<MenuMode, () => void> = {
      question1: () => {
        setMode('question1')
        setMenu([
          { to: 'question1', titleKey: 'base.menu.where', isActive: true },
          { to: 'main', titleKey: 'common.back' }
        ])
      },
      question2: () => {
        setMode('question2')
        setMenu([
          { to: 'question2', titleKey: 'base.menu.earth', isActive: true },
          { to: 'main', titleKey: 'common.back' }
        ])
      },
      question3: () => {
        setMode('question3')
        setMenu([
          { to: 'question3', titleKey: 'base.menu.danger', isActive: true },
          { to: 'main', titleKey: 'common.back' }
        ])
      },
      main: () => {
        setMode('main')
        setMenu(MENU)
      },
    }

    const onClick = () => {
      setTalk(true)
      soundRobotTalk.play()
      setTimeout(() => setTalk(false), 1000)
      const action = ACTIONS[to as MenuMode]
      if (action) return action()

      navigate(to)
    }
    return (
      <li
        className={classNames('', { [styles.active]: isActive })}
        onClick={onClick}>
        {t(titleKey)}
      </li>
    )
  }

  const Navigation = () => {
    return (
      <ul className={styles.navigation}>
        {menu.map((item, index) => (
          <NavigationItem key={index} to={item.to} titleKey={item.titleKey} isActive={item.isActive} />
        ))}
      </ul>
    )
  }

  const modalInfo = () => {
    return (
      <div className={styles['base-page__modal-info']}>
        <p>
          {t('base.briefing.paragraphs.one')}
        </p>
        <img src="./training/1.png"/>
        <p>
          {t('base.briefing.paragraphs.two')}
        </p>
        <img src="./training/2.webp"/>
        <p>
          {t('base.briefing.paragraphs.three')}
        </p>
        <img src="./training/3.webp"/>
        <p>
          {t('base.briefing.paragraphs.four')}
        </p>
        <img src="./training/4.webp"/>
        <p>
          {t('base.briefing.paragraphs.five')}
        </p>
        <img src="./training/5.webp"/>
        <p>
          {t('base.briefing.paragraphs.six')}
        </p>
        <img src="./training/6.png"/>
        <p>
          {t('base.briefing.paragraphs.seven')}
        </p>
        <p>{t('base.briefing.goodLuck')}</p>
      </div>
    )
  }
    
  return (
    <main className={styles['base-page']}>
      <div className={classNames(
        styles['base-page__wrap'],
        styles[`base-page__wrap_${mode}`],
      )}>
        <Navigation/>

        { mode === 'question1' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            <p>
              {t('base.questions.where.one')}
            </p>
            <p>
              {t('base.questions.where.two')}
            </p>
            <p>
              {t('base.questions.where.three')}
            </p>
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => setOpenModalInfo(true)}>
            {t('base.briefing.training')}
          </Button>
        </div> }

         { mode === 'question2' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            <p>
              {t('base.questions.earth.one')}
            </p>
            <p>
              {t('base.questions.earth.two')}
            </p>
            <p>
              {t('base.questions.earth.three')}
            </p>
            <p>
              {t('base.questions.earth.four')}
            </p>
            <p>
              {t('base.questions.earth.five')}
            </p>
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => setOpenModalInfo(true)}>
            {t('base.briefing.training')}
          </Button>
        </div> }

        { mode === 'question3' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            <p>
              {t('base.questions.danger.one')}
            </p>
            <p>
              {t('base.questions.danger.two')}
            </p>
            <p>
              {t('base.questions.danger.three')}
            </p>
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => setOpenModalInfo(true)}>
            {t('base.briefing.training')}
          </Button>
        </div> }

        <div className={styles['base-page__barman']}>
          <img src={talk ? imgBarmanTalk : imgBarmanDefault} />

          {mode === 'main' && 
            <p className={styles['base-page__barman-text-baloon']}>
              {blink}
            </p>}

          {mode === 'question1' && 
            <p className={styles['base-page__barman-text-baloon']}>
              find(a);
            </p>}

          {mode === 'question2' && 
            <p className={styles['base-page__barman-text-baloon']}>
              <span style={{ fontSize: '20px' }}>hello world!</span>
            </p>}

          {mode === 'question3' && 
            <p className={styles['base-page__barman-text-baloon']}>
              alert(c);
            </p>}
        </div>

        <UserTreasures/>
      </div>
      <ModalDefault
        className={styles['base-page__modal']}
        onContinue={handleTraining}
        onExit={() => setOpenModalInfo(false)}
        title={t('base.briefing.title')}
        subtitle={t('base.briefing.intro')}
        buttonSuccess={t('base.briefing.start')}
        buttonCancel={t('base.briefing.cancel')}
        info={modalInfo()}
        isOpened={isOpenModalInfo}
      />
    </main>
  )
}
