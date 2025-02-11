import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Item } from './item'
import { Button, LinkText, LEVELS_STATE } from '@/shared'
import { useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'
import bgMapInfo from '@/assets/images/level-map/climb.png'
import bgMap from '@/assets/images/level-map/map.jpg'
import styles from './styles.module.css'
import classNames from 'classnames'
import CloseIcon from '@mui/icons-material/Close'

export const LevelMap = () => {
  const navigate = useNavigate()
  const [levels, setLevels] = useState(LEVELS_STATE)
  const [level, setLevel] = useState(levels[0])
  const [isSelect, setSelect] = useState(false)
  const { game } = useUser()
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
    setSelect(true)
  }

  const handleClickClose = () => setSelect(false)

  const handleStartGame = () => {
    selectLevel(level.id)
    if (level.type === 'battle') {
      navigate('/game-battle', {})
    }
    if (level.type === 'tavern') {
      navigate('/tavern', {})
    }
  }

  const handleMainPage = () => navigate('/', {})

  const levelPoints = levels.map(level => {
    return (
      <Item
        key={level.id}
        id={level.id}
        x={level.x}
        y={level.y}
        isCurrent={level.isCurrent}
        isPassed={level.isPassed}
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
    <div 
      className={classNames(styles.levelMap, {
        [styles.levelMapSelect]: isSelect
      })}
    >
      <div className={styles.levelMapInfo}>
        <div className={styles.levelMapInfoWrap}>
          <div className={styles.levelMapInfoTitle}>
            <div>
              <h1>Уровень {selectedLevel.id}</h1>
              <h2>{selectedLevel.title}</h2>
            </div>
            <div className={styles.levelMapInfoClose} onClick={handleClickClose}>
              <CloseIcon />
            </div>
          </div>
          <div className={styles.levelMapInfoDesc}>
            <p>{selectedLevel.description}</p>
          </div>

          {selectedLevel.isPassed && (
            <Button onClick={handleStartGame}>
              {level.type === 'tavern' ? 'Зайти' : 'Играть'}
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

      <div className={styles.levelMapPoints}>
        {levelPoints}
      </div>

      <div className={styles.levelMapBg}>
        <img src={bgMap} />
      </div>
    </div>
  )
}
