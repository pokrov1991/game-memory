import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/components'
import { StoryPlayer } from '@/shared/components'
import { ICONS } from '@/shared/constants/icons'
import styles from './styles.module.css'
import BALLOONS_E1I from './balloons/episode-1/intro.json'
import BALLOONS_E1C from './balloons/episode-1/cliffhanger.json'

const imgSlideE1I1 = './cut-scene/episode-1/intro/1.jpg'
const imgSlideE1I2 = './cut-scene/episode-1/intro/2.jpg'
const imgSlideE1I3 = './cut-scene/episode-1/intro/3.jpg'
const imgSlideE1I4 = './cut-scene/episode-1/intro/4.jpg'
const imgSlideE1I5 = './cut-scene/episode-1/intro/5.jpg'
const imgSlideE1I6 = './cut-scene/episode-1/intro/6.jpg'
const imgSlideE1I7 = './cut-scene/episode-1/intro/7.jpg'
const imgSlideE1I8 = './cut-scene/episode-1/intro/8.jpg'
const imgSlideE1I9 = './cut-scene/episode-1/intro/9.jpg'
const imgSlideE1I10 = './cut-scene/episode-1/intro/10.jpg'
const imgSlideE1I11 = './cut-scene/episode-1/intro/11.jpg'
const imgSlideE1I12 = './cut-scene/episode-1/intro/12.jpg'
const imgSlideE1I13 = './cut-scene/episode-1/intro/13.jpg'
const imgSlideE1I14 = './cut-scene/episode-1/intro/14.jpg'
const imgSlideE1C1 = './cut-scene/episode-1/cliffhanger/1.jpg'
const imgSlideE1C2 = './cut-scene/episode-1/cliffhanger/2.jpg'
const imgSlideE1C3 = './cut-scene/episode-1/cliffhanger/3.jpg'
const imgSlideE1C4 = './cut-scene/episode-1/cliffhanger/4.jpg'
const imgSlideE1C5 = './cut-scene/episode-1/cliffhanger/5.jpg'
const imgSlideE1C6 = './cut-scene/episode-1/cliffhanger/6.jpg'
const imgSlideE1C7 = './cut-scene/episode-1/cliffhanger/7.jpg'

const slidesE1Intro: Record<number, string> = {
  1: imgSlideE1I1,
  2: imgSlideE1I2,
  3: imgSlideE1I3,
  4: imgSlideE1I4,
  5: imgSlideE1I5,
  6: imgSlideE1I6,
  7: imgSlideE1I7,
  8: imgSlideE1I8,
  9: imgSlideE1I9,
  10: imgSlideE1I10,
  11: imgSlideE1I11,
  12: imgSlideE1I12,
  13: imgSlideE1I13,
  14: imgSlideE1I14,
}

const slidesE1Cliffhanger: Record<number, string> = {
  1: imgSlideE1C1,
  2: imgSlideE1C2,
  3: imgSlideE1C3,
  4: imgSlideE1C4,
  5: imgSlideE1C5,
  6: imgSlideE1C6,
  7: imgSlideE1C7,
}

let slidesMap: Record<number, string> = { ...slidesE1Intro }
let balloonsMap: Record<string, { id: number, x: number, y: number, text: string }[]> = { ...BALLOONS_E1I }

export const IntroPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { part } = location.state || {}
  const [step, setStep] = useState(0)
  const [isPrevDisabled, setPrevDisabled] = useState(true)
  const [balloons, setBalloons] = useState([])

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
    if (step <= 2) {
      setPrevDisabled(true)
    }
  }

  const nextSlide = () => {
    if (step >= Object.keys(slidesMap).length) {
      navigate('/levels')
    } else {
      setStep(step + 1)
      setPrevDisabled(false)
    }
  }

  useEffect(() => {
    if (part === 'e1c') {
      slidesMap = { ...slidesE1Cliffhanger }
      balloonsMap = { ...BALLOONS_E1C }
      setStep(1)
    } else {
      slidesMap = { ...slidesE1Intro }
      balloonsMap = { ...BALLOONS_E1I }
    }
  }, [])

  useEffect(() => {
    setBalloons(balloonsMap[`slide-${step}` as keyof typeof balloonsMap] || [])
  }, [step])
    
  return (
    <main className={styles['intro-page']}>
      <div className={styles['intro-page__actions']}>
        <div className={classNames(styles['intro-page__actions-btn'])} onClick={() => navigate('/levels')}>
          Пропустить
        </div>
        <div className={classNames(
          styles['intro-page__actions-btn'], 
          { [styles['intro-page__actions-btn_disabled']]: isPrevDisabled })
        } onClick={!isPrevDisabled ? prevStep : null}>
          Назад
        </div>
        <Button onClick={nextSlide}>Дальше</Button>
      </div>

      {(step === 0 && !part) && (
        <div className={styles['intro-page__start']}>
          <div className={styles['intro-page__start-wrap']}>
            <span>
              Разгар космической гонки.<br />
              Где-то на орбите Земли, вдали от глаз, дрейфует американская станция.
            </span>
          </div>
        </div>
      )}
       {(step === 7 && part === 'e1c') && (
        <div className={styles['intro-page__start']}>
          <div className={styles['intro-page__start-wrap']}>
            <span>
              Продолжение следует...
            </span>
          </div>
        </div>
      )}

      {step > 0 && (
        <div className={styles['intro-page__slide']}>
          <div className={styles['intro-page__slide-wrap']}>
            {false && balloons.map((balloon, index) => (
              <div 
                key={index} 
                className={styles['intro-page__balloon']}
                style={{ left: `calc(${balloon.x}% - 125px)`, top: `calc(${balloon.y}% - 55px)` }}
              >
                <div className={styles['intro-page__balloon-wrap']}>
                  <span>{balloon.text}</span>
                </div>
              </div>
            ))}
            <img src={slidesMap[step as keyof typeof slidesMap]} />
          </div>
        </div>
      )}

      {step > 0 && (
        <div className={styles['intro-page__info']}>
          {balloons[1]?.text && <div className={styles['intro-page__info-enemy']}>
            {part === 'e1c' && <div className={styles['intro-page__info-antogonist']}>
              <StoryPlayer isAntogonist={true} />
            </div>}
            {part !== 'e1c' && <div className={styles['intro-page__info-enemy-img']}>
              <img src={ICONS.VoiceAnimation} />
            </div>}
            <div className={styles['intro-page__info-enemy-text']}>
              <p>{balloons[1]?.text}</p>
            </div>
          </div>}
          <div className={styles['intro-page__info-player']}>
            <div className={styles['intro-page__info-player-img']}>
              <StoryPlayer isAntogonist={step <= 9 && !part} />
            </div>
            <div className={styles['intro-page__info-player-text']}>
              <p>{balloons[0]?.text}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
