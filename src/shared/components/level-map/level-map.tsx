import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Item } from './item'
import { Button, ModalDefault, LinkText, LEVELS_STATE } from '@/shared'
import { useProgress, useMusic } from '@/shared/hooks'
import styles from './styles.module.css'
import classNames from 'classnames'
import CloseIcon from '@mui/icons-material/Close'
import { GameLevelStateType } from '@/shared/services/game/types'

const bgMapInfo = './ui/level-map/climb.png'
const bgMap = './ui/level-map/map.jpg'
const cloudOne = './ui/level-map/cloud-1.png'
const cloudTwo = './ui/level-map/cloud-2.png'
const cloudThree = './ui/level-map/cloud-3.png'

export const LevelMap = () => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const [selectedLevelId, setSelectedLevelId] = useState(LEVELS_STATE[0].id)
  const [isSelect, setSelect] = useState(false)
  const [isOpenModalInfo, setOpenModalInfo] = useState(false)
  const { completedLevels, selectLevel } = useProgress()

  const currentLevelId = completedLevels[completedLevels.length - 1]
  const levels = useMemo<GameLevelStateType[]>(() => {
    return LEVELS_STATE.map(level => ({
      ...level,
      isPassed: completedLevels.includes(level.id),
      isCurrent: level.id === selectedLevelId,
    }))
  }, [completedLevels, selectedLevelId])
  const level = levels.find(level => level.id === selectedLevelId) || levels[0]

  const soundClick = useMusic({ src: './music/click.mp3', type: 'effect' })

  useEffect(() => {
    setSelectedLevelId(currentLevelId)
    setSelect(false)
  }, [currentLevelId])

  const handleMapLoad = () => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }

  const handleClickLevel = (levelId: number) => {
    soundClick.play()
    setSelectedLevelId(levelId)
    setSelect(true)
  }

  const handleMainPage = () => {
    soundClick.play()
    setTimeout(() => navigate('/'), 100)
  }

  const handleClickClose = () => {
    setSelect(false)
  }

  const handleStartGame = () => {
    if (level.id > 6 && level.id !==101 && level.id !==102) {
      navigate('/intro', { state: {part: 'e1c'}})
      // setOpenModalInfo(true)
      return
    }
    selectLevel(level.id)
    if (level.type === 'battle') {
      navigate('/game-battle', {})
    }
    if (level.type === 'tavern') {
      navigate('/tavern', {})
    }
    if (level.type === 'base') {
      navigate('/base', {})
    }
    soundClick.play()
  }

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
              <h1>{[101, 102].includes(selectedLevel.id) ? 'Локация' : `Уровень ${selectedLevel.id}`}</h1>
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
              {level.type === 'tavern' || level.type === 'base' ? 'Зайти' : 'Играть'}
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

      <div className={styles.levelMapPoints} ref={scrollRef}>
        <div className={styles.levelMapPointsWrap}>
          <div className={styles.levelMapClouds}>
            <img src={cloudOne} className={styles.levelMapCloudOne} />
            <img src={cloudTwo} className={styles.levelMapCloudTwo} />
            <img src={cloudThree} className={styles.levelMapCloudThree} />
          </div>
          {levelPoints}

          <div className={styles.levelMapBg}>
            <div className={styles.levelMapBgBack}>
              <LinkText onClick={handleMainPage}>Назад в меню</LinkText>
            </div>
            <img src={bgMap} onLoad={handleMapLoad} />
          </div>       
        </div>
      </div>

      <ModalDefault
        onContinue={() => setOpenModalInfo(false)}
        title="[ + _ + ]"
        subtitle="Первая глава закончилась"
        info="Продолжение следует..."
        buttonSuccess='Ok'
        isOpened={isOpenModalInfo}
        isButtonCancel={false}
      />
    </div>
  )
}
