import classNames from 'classnames'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEVELS_STORE, INVENTORY_STORE_CONFIG } from '@/shared'
import { useProgress } from '@/shared/hooks'
import { GameLevelStoreType } from '@/shared/services/game/types'
import imgBarmanDefault from '/tavern/default.webp'
import imgBarmanTalk from '/tavern/talk.webp'
import styles from './styles.module.css'

type MenuMode = 'main' | 'levels' | 'store'
type MenuItem = { to: string; title: string; isActive?: boolean }

const MENU: Array<MenuItem> = [
  { to: 'levels', title: 'Игра на монеты' },
  { to: 'store', title: 'Купить товыры' },
  { to: '/levels', title: 'Выход' }
]

export const TavernPage = () => {
  const navigate = useNavigate()
  const [levels, setLevels] = useState(LEVELS_STORE)
  const [inventories, setInventories] = useState(INVENTORY_STORE_CONFIG)
  const [inventoryInfo, setInventoryInfo] = useState(inventories[0])
  const [menu, setMenu] = useState(MENU)
  const [mode, setMode] = useState('main')
  const [talk, setTalk] = useState(false)
  const { selectLevel } = useProgress()

  const handleClickLevel = (levelId: number) => {
    const level = {...levels[levelId - 1]}

    selectLevel(level.id)
    if (level.type === 'store') {
      navigate('/game-store', {})
    }
  }

  const levelPreviews = levels.map(level => {
    return (
      <div 
        className={styles['tavern-page__levels-item']} 
        onClick={() => handleClickLevel(level.id)} 
        key={level.id}
      >
        <b>
          <span>{level.title}</span>
          <span>{level.cardCount}</span>
        </b>
        <p>
          <span>{level.coins} монет</span>
          <span>{level.gameTimer} секунд</span>
        </p>
      </div>
    )
  })

  const handleClickStore = (inventoryId: number) => {
    setInventoryInfo(inventories.find(item => item.id === inventoryId))
  }

  const inventoryPreviews = inventories.map(item => {
    return (
      <div 
        className={classNames(
          styles['tavern-page__store-item'], 
          { [styles['tavern-page__store-item_active']]: inventoryInfo?.id === item.id })
        }
        onClick={() => handleClickStore(item.id)}
        key={item.id}
      >
        <span>{item.hp}</span>
      </div>
    )
  })

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
      levels: () => {
        setMode('levels')
        setMenu([
          { to: 'levels', title: 'Игра на монеты', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      store: () => {
        setMode('store')
        setMenu([
          { to: 'store', title: 'Купить товары', isActive: true },
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
    
  return (
    <main className={styles['tavern-page']}>
      <div className={classNames(
        styles['tavern-page__wrap'],
        styles[`tavern-page__wrap_${mode}`],
      )}>
        <Navigation/>
        { mode === 'levels' && <div className={styles['tavern-page__levels']}>
          {levelPreviews}
        </div> }
        { mode === 'store' && <div className={styles['tavern-page__store']}>
          {inventoryPreviews}
        </div> }
        <div className={styles['tavern-page__barman']}>
          <img src={talk ? imgBarmanTalk : imgBarmanDefault} />
          {mode === 'main' && 
            <p className={styles['tavern-page__barman-text-main']}>Здравствуй путник!<br/>Чего желаешь?</p>}
          {mode === 'store' && inventoryInfo && 
          <p className={styles['tavern-page__barman-text-store']}>
            <strong>{inventoryInfo.name}</strong>
            <span>{inventoryInfo.desc}</span>
            <b>
              <i>Монет: {inventoryInfo.price}.</i>
              {inventoryInfo.enemyOrgans && inventoryInfo.enemyOrgans.map((item, index) => (
                <i key={index}>{item.name}: {item.count}.</i>
              ))}
            </b>
          </p>
          }
        </div>
      </div>
    </main>
  )
}
