import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components'
import { StoryPlayer } from '@/shared/components'
import { ICONS } from '@/shared/constants/icons'
import styles from './styles.module.css'
import BALLOONS from './balloons.json'

const imgSlide1 = './intro/1.jpg'
const imgSlide2 = './intro/2.jpg'
const imgSlide3 = './intro/3.jpg'
const imgSlide4 = './intro/4.jpg'
const imgSlide5 = './intro/5.jpg'
const imgSlide6 = './intro/6.jpg'
const imgSlide7 = './intro/7.jpg'
const imgSlide8 = './intro/8.jpg'
const imgSlide9 = './intro/9.jpg'
const imgSlide10 = './intro/10.jpg'
const imgSlide11 = './intro/11.jpg'
const imgSlide12 = './intro/12.jpg'
const imgSlide13 = './intro/13.jpg'
const imgSlide14 = './intro/14.jpg'

const slides = {
  1: imgSlide1,
  2: imgSlide2,
  3: imgSlide3,
  4: imgSlide4,
  5: imgSlide5,
  6: imgSlide6,
  7: imgSlide7,
  8: imgSlide8,
  9: imgSlide9,
  10: imgSlide10,
  11: imgSlide11,
  12: imgSlide12,
  13: imgSlide13,
  14: imgSlide14
}

export const IntroPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isPrevDisabled, setPrevDisabled] = useState(true)
  const [balloons, setBalloons] = useState([])

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
    if (step === 1) {
      setPrevDisabled(true)
    }
  }

  const nextSlide = () => {
    if (step >= Object.keys(slides).length) {
      navigate('/levels')
    } else {
      setStep(step + 1)
      setPrevDisabled(false)
    }
  }

  useEffect(() => {
    setBalloons(BALLOONS[`slide-${step}` as keyof typeof BALLOONS] || [])
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
        } onClick={prevStep}>
          Назад
        </div>
        <Button onClick={nextSlide}>Дальше</Button>
      </div>
      {step === 0 && (
        <div className={styles['intro-page__start']}>
          <div className={styles['intro-page__start-wrap']}>
            <span>
              Разгар космической гонки.<br />
              Где-то на орбите Земли, вдали от глаз, дрейфует американская станция.
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
            <img src={slides[step as keyof typeof slides]} />
          </div>
        </div>
      )}

      {step > 0 && (
        <div className={styles['intro-page__info']}>
          {balloons[1]?.text && <div className={styles['intro-page__info-enemy']}>
            <div className={styles['intro-page__info-enemy-img']}>
              <img src={ICONS.VoiceAnimation} />
            </div>
            <div className={styles['intro-page__info-enemy-text']}>
              <p>{balloons[1]?.text}</p>
            </div>
          </div>}
          <div className={styles['intro-page__info-player']}>
            <div className={styles['intro-page__info-player-img']}>
              <StoryPlayer />
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
