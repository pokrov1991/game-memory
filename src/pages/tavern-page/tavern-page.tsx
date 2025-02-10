import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LinkText,
  LEVELS_STORE
} from '@/shared'
import { useProgress } from '@/shared/hooks'
import { GameLevelStoreType } from '@/shared/services/game/types'
import styles from './styles.module.css'

export const TavernPage = () => {
  const navigate = useNavigate()
  const [levels, setLevels] = useState(LEVELS_STORE)
  const { selectLevel } = useProgress()

  const levelPreviews = levels.map(level => {
    return (
      <div 
        className={
          classNames(
            styles['tavern-page__levels-item'],
          )
        } 
        onClick={() => handleClickLevel(level.id)} 
        key={level.id}
      >
        title: {level.title}
        id: {level.id}
        coin: {level.coin}
        timer: {level.gameTimer}
        count: {level.cardCount}
      </div>
    )
  })

  const handleClickLevel = (levelId: number) => {
    const levelCurrent = {...levels[levelId - 1]}
    handleStartGame(levelCurrent)
  }

  const handleStartGame = (level: GameLevelStoreType) => {
    selectLevel(level.id)
    if (level.type === 'store') {
      navigate('/game-store', {})
    }
  }

  const handleMainPage = () => navigate('/levels', {})
  
  return (
    <main className={styles['tavern-page']}>
      Таверна
      <div className={styles['tavern-page__levels']}>
        {levelPreviews}
      </div>
      <LinkText onClick={handleMainPage}>Назад</LinkText>
    </main>
  )
}
