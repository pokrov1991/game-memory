import classNames from 'classnames'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, UserTreasures } from '@/shared/components'
import { useProgress } from '@/shared/hooks/useProgress'
import imgBarmanDefault from '/base/baseman.png'
import imgBarmanTalk from '/tavern/talk.webp'
import styles from './styles.module.css'

type MenuMode = 'main' | 'question1' | 'question2' | 'question3'
type MenuItem = { to: string; title: string; isActive?: boolean }

const MENU: Array<MenuItem> = [
  { to: 'question1', title: 'Где я?' },
  { to: 'question2', title: 'Как вернуться на Землю?' },
  { to: 'question3', title: 'Этот мир опасен?' },
  { to: '/levels', title: 'Выход' }
]

export const BasePage = () => {
  const navigate = useNavigate()
  const [menu, setMenu] = useState(MENU)
  const [mode, setMode] = useState('main')
  const [talk, setTalk] = useState(false)
  const { selectLevel } = useProgress()
  const scrollRef = useRef(null);
  
  const handleTraining = () => {
    console.log('training')
    selectLevel(0)
    navigate('/game-battle', {})
  }

  const NavigationItem = ({
    to,
    title,
    isActive = false,
  }: {
    to?: string
    title: string
    isActive?: boolean
  }) => {
    const ACTIONS: Record<MenuMode, () => void> = {
      question1: () => {
        setMode('question1')
        setMenu([
          { to: 'question1', title: 'Где я?', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      question2: () => {
        setMode('question2')
        setMenu([
          { to: 'question2', title: 'Как вернуться на Землю?', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      question3: () => {
        setMode('question3')
        setMenu([
          { to: 'question3', title: 'Этот мир опасен?', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      main: () => {
        setMode('main')
        setMenu(MENU)
      },
    }

    const onClick = () => {
      setTalk(true)
      setTimeout(() => setTalk(false), 1000)
      const action = ACTIONS[to as MenuMode]
      if (action) return action()

      navigate(to)
    }
    return (
      <li
        className={classNames('', { [styles.active]: isActive })}
        onClick={onClick}>
        {title}
      </li>
    )
  }

  const Navigation = () => {
    return (
      <ul className={styles.navigation}>
        {menu.map((item, index) => (
          <NavigationItem key={index} to={item.to} title={item.title} isActive={item.isActive} />
        ))}
      </ul>
    )
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
            Текст 1
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => handleTraining()}>
            Обучение
          </Button>
        </div> }

         { mode === 'question2' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            Текст 2
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => handleTraining()}>
            Обучение
          </Button>
        </div> }

        { mode === 'question3' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            Текст 3
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => handleTraining()}>
            Обучение
          </Button>
        </div> }

        <div className={styles['base-page__barman']}>
          <img src={talk ? imgBarmanTalk : imgBarmanDefault} />

          {mode === 'main' && 
            <p className={styles['base-page__barman-text-main']}>
              Бип, пип, пап<br/>пуп, пуп, бип...
            </p>}

          {mode === 'question1' && 
            <p className={styles['base-page__barman-text-baloon']}>
              Текст балуна 1
            </p>}

          {mode === 'question2' && 
            <p className={styles['base-page__barman-text-baloon']}>
              Текст балуна 2
            </p>}

          {mode === 'question3' && 
            <p className={styles['base-page__barman-text-baloon']}>
              Текст балуна 3
            </p>}
        </div>

        <UserTreasures/>
      </div>
    </main>
  )
}
