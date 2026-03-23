import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components'
import imgSlide1 from '/intro/1.jpg'
import imgSlide2 from '/intro/2.jpg'
import imgSlide3 from '/intro/3.jpg'
import imgSlide4 from '/intro/4.jpg'
import imgSlide5 from '/intro/5.jpg'
import imgSlide6 from '/intro/6.jpg'
import imgSlide7 from '/intro/7.jpg'
import imgSlide8 from '/intro/8.jpg'
import imgSlide9 from '/intro/9.jpg'
import imgSlide10 from '/intro/10.jpg'
import imgSlide11 from '/intro/11.jpg'
import imgSlide12 from '/intro/12.jpg'
import imgSlide13 from '/intro/13.jpg'
import imgSlide14 from '/intro/14.jpg'
import styles from './styles.module.css'
import BALLOONS from './balloons.json'

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
            {balloons.map((balloon, index) => (
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
    </main>
  )
}
