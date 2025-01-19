import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Item } from './item'
import { mergeObjects, Button, LinkText, LEVELS, LEVELS_INFO } from '@/shared'
import { useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import bgMapInfo from '@/assets/images/level-map/climb.png'
import bgMap from '@/assets/images/level-map/map.jpg'
import styles from './styles.module.css'

export const LevelMap = () => {
  const navigate = useNavigate()
  const [levels, setLevels] = useState(mergeObjects(LEVELS, LEVELS_INFO))
  const [level, setLevel] = useState(levels[0])
  const { game } = useUser();
  const { completedLevels, selectLevel } = useProgress()

  const cCompletedLevels = completedLevels.length > 1 ? completedLevels : game.completedLevels

  useEffect(() => {
    levels.forEach(level => {
      if (cCompletedLevels.includes(level.id)) {
        level.isPassed = true
      }
      level.isCurrent = false
      if (level.id === cCompletedLevels[cCompletedLevels.length - 1]) {
        level.isCurrent = true
        setLevel(level)
      }
    })
  }, [cCompletedLevels])

  const handleClickLevel = (levelId: number) => {
    levels.forEach(level => {
      level.isCurrent = false
      if (level.id === levelId) {
        level.isCurrent = true
        setLevel(level)
      }
    })
    setLevels(levels)
  }

  const handleStartGame = () => {
    selectLevel(level.id)
    navigate('/game', {})
  }

  const handleMainPage = () => navigate('/', {})

  const levelPoints = levels.map(level => {
    const currentLevel = level as {
      id: number
      x: number
      y: number
      isCurrent: boolean
      isPassed: boolean
    }
    return (
      <Item
        key={currentLevel.id}
        id={currentLevel.id}
        x={currentLevel.x}
        y={currentLevel.y}
        isCurrent={currentLevel.isCurrent}
        isPassed={currentLevel.isPassed}
        onClick={(id: number) => handleClickLevel(id)}
      />
    )
  })

  const selectedLevel = level as {
    id: number
    title: string
    description: string
    isPassed: boolean
  }

  return (
    <div className={styles.levelMap}>
      <div className={styles.levelMapInfo}>
        <div className={styles.levelMapInfoWrap}>
          <div className={styles.levelMapInfoTitle}>
            <h1>Уровень {selectedLevel.id}</h1>
            <h2>{selectedLevel.title}</h2>
          </div>
          <div className={styles.levelMapInfoDesc}>
            <p>{selectedLevel.description}</p>
          </div>

          {selectedLevel.isPassed && (
            <Button onClick={handleStartGame}>
              Играть
            </Button>
          )}

          <div className={styles.levelMapInfoBack}>
            <LinkText onClick={handleMainPage}>Назад в меню</LinkText>
          </div>
        </div>
        <div className={styles.levelMapInfoBg}>
          <img src={bgMapInfo} />
        </div>
      </div>

      <div className={styles.levelMapBg}>
        {levelPoints}
        <img src={bgMap} />
      </div>
    </div>
  )
}
