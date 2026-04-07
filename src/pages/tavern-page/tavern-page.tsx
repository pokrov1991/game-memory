import classNames from 'classnames'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEVELS_STORE, INVENTORY_STORE_CONFIG } from '@/shared'
import { useProgress } from '@/shared/hooks'
import { Button, UserTreasures, XpManager, ModalDefault } from '@/shared/components'
import { GameLevelStoreType } from '@/shared/services/game/types'
import YandexSDK from '@/shared/services/sdk/yandexSdk'
import imgBarmanDefault from '/tavern/default.webp'
import imgBarmanTalk from '/tavern/talk.webp'
import styles from './styles.module.css'

type MenuMode = 'main' | 'levels' | 'store' | 'xp'
type MenuItem = { to: string; title: string; isActive?: boolean }

const MENU: Array<MenuItem> = [
  { to: 'levels', title: 'Игра на монеты' },
  { to: 'store', title: 'Купить товары' },
  { to: 'xp', title: 'Сферы энергии' },
  { to: '/levels', title: 'Выход' }
]

export const TavernPage = () => {
  const navigate = useNavigate()
  const [levels, setLevels] = useState(LEVELS_STORE)
  const [level, setLevel] = useState(LEVELS_STORE[0])
  const [storeInventory, setStoreInventory] = useState(INVENTORY_STORE_CONFIG)
  const [storeInventoryItem, setStoreInventoryItem] = useState(storeInventory[0])
  const [isOpenModalDefault, setOpenModalDefault] = useState(false)
  const [isButtonPay, setIsButtonPay] = useState(true)
  const [isButtonPayDisabled, setIsButtonPayDisabled] = useState(true)
  const [menu, setMenu] = useState(MENU)
  const [mode, setMode] = useState('main')
  const [talk, setTalk] = useState(false)
  const { progress, selectLevel, userCoins, userPotions, userOrgans, userInventory, coinsUp, potionsUp, updateOrgan, updateInventory } = useProgress()
  const scrollRef = useRef(null);
  
  const syncProgress = async () => {
    await YandexSDK.setGameData(progress)
  }

  useEffect(() => {
    // Мержим конфиг и прогресс юзера по инвентарю, что бы отображать актуальное состояние
    const inventoryMap = new Map(userInventory.map(item => [item.id, item]))
    const merged = INVENTORY_STORE_CONFIG.map(item => ({
      ...item,
      ...inventoryMap.get(item.id)
    }))
    setStoreInventory(merged)
  }, [userInventory])

  useEffect(() => {
    // Оновляем выбранный айтем в магазине при изменении инвентаря
    handleClickStore(storeInventoryItem.id)
    // Синхронизируем прогресс с сервером при изменении инвентаря
    syncProgress()
  }, [storeInventory])

  useEffect(() => {
    // Оновляем выбранный айтем в магазине при изменении кол-ва зелий
    handleClickStore(storeInventoryItem.id)
    syncProgress()
  }, [userPotions])

  const handleClickStore = (inventoryId: number) => {
    const inventory = storeInventory.find(item => item.id === inventoryId)
    setStoreInventoryItem(inventory)

    setIsButtonPay(true)
    setIsButtonPayDisabled(false)
    if (userCoins < inventory.price) {
      setIsButtonPayDisabled(true)
    }
    if (inventory.organs) {
      inventory.organs.forEach(item => {
        if (userOrgans[item.id]?.count < item.count) {
          setIsButtonPayDisabled(true)
        }
      })
    }
    if (inventory.isPaid) {
      setIsButtonPay(false)
    }

    setTalk(true)
    setTimeout(() => setTalk(false), 1000)
  }

  const handlePay = async () => {
    const type = storeInventoryItem.type
    const coins = userCoins - storeInventoryItem.price
    if (type === 'potion') {
      potionsUp(userPotions + 1)
    }
    if (type === 'helmet' || type === 'plastron') {
      storeInventoryItem.organs.forEach(item => {
        const userOrgan = userOrgans[item.id]
        if (userOrgan) {
          updateOrgan({ organId: item.id, count: userOrgan.count - item.count })
        }
      })
      updateInventory([...userInventory, { ...storeInventoryItem, isPaid: true }])
    }
    coinsUp(coins)
  }

  const handleDress = async () => {
    const updateStoreInventory = userInventory.map(item => {
      if (item.type === storeInventoryItem.type && item.id !== storeInventoryItem.id) {
        return { ...item, isDressed: false }
      }
      if (item.id === storeInventoryItem.id) {
        return { ...item, isDressed: true }
      }
      return item
    })
    updateInventory([...updateStoreInventory])
  }

  const storeInventoryPreviews = storeInventory.map(item => {
    return (
      <div className={classNames(
          styles['tavern-page__store-item'],
          styles[`tavern-page__store-item_${item.id}`], 
          {
            [styles['tavern-page__store-item_active']]: storeInventoryItem?.id === item.id,
            [styles['tavern-page__store-item_dressed']]: userInventory.find(i => i.id === item.id && i.isDressed),
            [styles['tavern-page__store-item_paid']]: userInventory.find(i => i.id === item.id && i.isPaid)
          }
        )}
        onClick={() => handleClickStore(item.id)}
        key={item.id}>
        <span>{item.price}</span>
      </div>
    )
  })

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
        className={classNames(
          styles['tavern-page__levels-item'],
          {[styles['tavern-page__levels-item_disabled']]: userCoins < level.coins}
        )}
        onClick={() => {
          setLevel(level)
          setOpenModalDefault(true)
        }} 
        key={level.id}>
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
      xp: () => {
        setMode('xp')
        setMenu([
          { to: 'xp', title: 'Сферы энергии', isActive: true },
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
    <main className={styles['tavern-page']}>
      <div className={classNames(
        styles['tavern-page__wrap'],
        styles[`tavern-page__wrap_${mode}`],
      )}>
        <Navigation/>

        { mode === 'levels' && <div className={styles['tavern-page__levels']}>
          <button className={styles['tavern-page__levels-up']} onClick={scrollUp}></button>
          <div className={styles['tavern-page__levels-scroll']} ref={scrollRef}>
            {levelPreviews}
          </div>
          <button className={styles['tavern-page__levels-down']} onClick={scrollDown}></button>
        </div> }

        { mode === 'store' && <div className={styles['tavern-page__store']}>
          <div className={styles['tavern-page__store-items']}>
            {storeInventoryPreviews}
          </div>
          <div className={styles['tavern-page__store-action']}>
            {isButtonPay ? 
            <Button disabled={isButtonPayDisabled} onClick={() => handlePay()}>
              Купить
            </Button> : 
            <Button onClick={() => handleDress()}>
              Надеть
            </Button>}
          </div>
        </div> }

        { mode === 'xp' && <div className={styles['tavern-page__xp']}>
          <XpManager/>
        </div> }

        <div className={styles['tavern-page__barman']}>
          <img src={talk ? imgBarmanTalk : imgBarmanDefault} />

          {mode === 'main' && 
            <p className={styles['tavern-page__barman-text-main']}>
              Здравствуй путник!<br/>Чего желаешь?
            </p>}

          {mode === 'levels' && 
            <p className={styles['tavern-page__barman-text-baloon']}>
              Выбери соперника, который тебе по зубам. Если победишь - получаешь монетки, если проиграешь - теряешь их. Что скажешь?
            </p>}

          {mode === 'store' && storeInventoryItem && 
            <p className={styles['tavern-page__barman-text-baloon']}>
              <strong>{storeInventoryItem.name}</strong>
              <span>{storeInventoryItem.desc}</span>
              <b>
                <i className={classNames(
                  styles['barman-text-item'],
                  styles['barman-text-item_money'],
                  {[styles['barman-text-item_disabled']]: userCoins < storeInventoryItem.price}
                )}>
                  {storeInventoryItem.price}
                </i>
                {storeInventoryItem.organs && storeInventoryItem.organs.map((item, index) => (
                  <i className={classNames(
                    styles['barman-text-item'],
                    styles[`barman-text-item_${item.id}`],
                    {[styles['barman-text-item_disabled']]: userOrgans[item.id]?.count < item.count}
                  )} key={index} title={item.name}>
                    {item.count}
                  </i>
                ))}
              </b>
            </p>}

          {mode === 'xp' && 
            <p className={styles['tavern-page__barman-text-baloon']}>
              У тебя есть сферы энергии, которые ты можешь потратить на улучшение своих характеристик. Чем выше уровень, тем больше сфер для распределения. На что хочешь потратить свои сферы?
            </p>}
        </div>

        <UserTreasures/>
      </div>

      <ModalDefault
        onContinue={() => handleClickLevel(level.id)}
        onExit={() => setOpenModalDefault(false)}
        title={level.title}
        subtitle={`На кону ${level.coins} монет! В случае победы, вы получите их, а в случае поражения - потеряете.`}
        info={`Вы желаете сразиться с ${level.title}?`}
        isOpened={isOpenModalDefault}
      />
    </main>
  )
}
