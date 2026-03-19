import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components'
import imgSlide1 from '/intro/1.jpg'
import imgSlide2 from '/intro/2.jpg'
import styles from './styles.module.css'
import BALLOONS from './balloons.json'

const slides = {
  1: imgSlide1,
  2: imgSlide2,
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
            <span>Давным-давно, в далекой-далекой галактике..</span>
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
                style={{ left: `${balloon.x}px`, top: `${balloon.y}px` }}
              >
                <span>{balloon.text}</span>
              </div>
            ))}
            <img src={slides[step as keyof typeof slides]} />
          </div>
        </div>
      )}
    </main>
  )
}
