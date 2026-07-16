import classNames from 'classnames'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEVELS_STORE, INVENTORY_STORE_CONFIG } from '@/shared'
import { useProgress, useMusic } from '@/shared/hooks'
import { Button, UserTreasures, XpManager, ModalDefault } from '@/shared/components'
import { platformApi } from '@/shared/services/platform'
import { ACHIEVEMENTS } from '@/shared/services/platform/config'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'

type MenuMode = 'main' | 'levels' | 'store' | 'xp'
type MenuItem = { to: string; titleKey: string; isActive?: boolean }

const imgBarmanDefault = './tavern/default.webp'
const imgBarmanTalk = './tavern/talk.webp'

const MENU: Array<MenuItem> = [
  { to: 'levels', titleKey: 'tavern.menu.coinsGame' },
  { to: 'store', titleKey: 'tavern.menu.store' },
  { to: 'xp', titleKey: 'tavern.menu.energySpheres' },
  { to: '/levels', titleKey: 'common.exit' }
]

export const TavernPage = () => {
  const { t } = useI18n()
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
  const { progress, userCoins, userPotions, userOrgans, userInventory, coinsUp, potionsUp, updateOrgan, updateInventory } = useProgress()
  const scrollRef = useRef(null);

  const soundPigTalk = useMusic({ src: './music/tavern/pig-talk.wav', type: 'effect' })
  
  const syncProgress = async () => {
    await platformApi.setGameData(progress)
  }

  useEffect(() => {
    if (userCoins < 5) {
      coinsUp(5)
    }
  }, [])

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
    updateSelectedStoreItem(storeInventoryItem.id)
    // Синхронизируем прогресс с сервером при изменении инвентаря
    syncProgress()
  }, [storeInventory])

  useEffect(() => {
    // Оновляем выбранный айтем в магазине при изменении кол-ва зелий
    updateSelectedStoreItem(storeInventoryItem.id)
    syncProgress()
  }, [userPotions])

  const updateSelectedStoreItem = (inventoryId: number) => {
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
  }

  const handleClickStore = (inventoryId: number) => {
    updateSelectedStoreItem(inventoryId)
    setTalk(true)
    setTimeout(() => setTalk(false), 1000)
    soundPigTalk.play()
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
      const nextInventory = [...userInventory, { ...storeInventoryItem, isPaid: true }]
      updateInventory(nextInventory)
      
      unlockAchievementCompleteInventory(nextInventory)
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

  const unlockAchievementCompleteInventory = async (
    nextInventory: typeof userInventory
  ): Promise<void> => {
    const paidInventoryIds = new Set(nextInventory
      .filter(item => item.isPaid)
      .map(item => item.id)
    )

    const isComplete = INVENTORY_STORE_CONFIG
      .filter(item => item.type !== 'potion')
      .every(item => paidInventoryIds.has(item.id))

    if (!isComplete) return

    const isUnlocked = await platformApi.getAchievement(ACHIEVEMENTS.COMPLETE_INVENTORY)
    if (!isUnlocked) {
      await platformApi.unlockAchievement(ACHIEVEMENTS.COMPLETE_INVENTORY)
    }
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

    if (level.type === 'store') {
      navigate('/game-store', { state: {levelId: level.id}})
    }
  }

  const levelPreviews = levels.map(level => {
    const levelTitle = t(`levels.store.${level.id}.title`)

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
          <span>{levelTitle}</span>
          <span>{level.cardCount}</span>
        </b>
        <p>
          <span>{level.coins} {t('common.coins')}</span>
          <span>{level.gameTimer} {t('common.seconds')}</span>
        </p>
      </div>
    )
  })

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
      levels: () => {
        setMode('levels')
        setMenu([
          { to: 'levels', titleKey: 'tavern.menu.coinsGame', isActive: true },
          { to: 'main', titleKey: 'common.back' }
        ])
      },
      store: () => {
        setMode('store')
        setMenu([
          { to: 'store', titleKey: 'tavern.menu.store', isActive: true },
          { to: 'main', titleKey: 'common.back' }
        ])
      },
      xp: () => {
        setMode('xp')
        setMenu([
          { to: 'xp', titleKey: 'tavern.menu.energySpheres', isActive: true },
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
      setTimeout(() => setTalk(false), 1000)
      soundPigTalk.play()
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
              {t('tavern.buy')}
            </Button> : 
            <Button onClick={() => handleDress()}>
              {t('tavern.dress')}
            </Button>}
          </div>
        </div> }

        { mode === 'xp' && <div className={styles['tavern-page__xp']}>
          <XpManager/>
        </div> }

        <div className={styles['tavern-page__barman']}>
          <img src={talk ? imgBarmanTalk : imgBarmanDefault} />

          {mode === 'main' && 
            <div className={styles['tavern-page__barman-text-main']}>
              <p>{t('tavern.text.main')}<br/>{t('tavern.text.mainQuestion')}</p>
            </div>}

          {mode === 'levels' && 
            <div className={styles['tavern-page__barman-text-baloon']}>
              <p>{t('tavern.text.levels')}</p>
            </div>}

          {mode === 'store' && storeInventoryItem && 
            <div className={styles['tavern-page__barman-text-baloon']}>
              <p>
              <strong>{t(`inventory.items.${storeInventoryItem.id}.name`)}</strong>
              <span>{t(`inventory.items.${storeInventoryItem.id}.desc`)}</span>
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
                  )} key={index} title={t(`inventory.organs.${item.id}`)}>
                    {item.count}
                  </i>
                ))}
              </b>
              </p>
            </div>}

          {mode === 'xp' && 
            <div className={styles['tavern-page__barman-text-baloon']}>
              <p>{t('tavern.text.xp')}</p>
            </div>}
        </div>

        <UserTreasures/>
      </div>

      <ModalDefault
        onContinue={() => handleClickLevel(level.id)}
        onExit={() => setOpenModalDefault(false)}
        title={t(`levels.store.${level.id}.title`)}
        subtitle={`${t('tavern.modal.stakeStart')} ${level.coins} ${t('tavern.modal.stakeEnd')}`}
        info={`${t('tavern.modal.versus')} ${t(`levels.store.${level.id}.title`)}?`}
        isOpened={isOpenModalDefault}
      />
    </main>
  )
}
