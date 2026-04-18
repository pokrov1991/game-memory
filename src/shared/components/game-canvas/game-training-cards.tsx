import { useState, useEffect } from 'react'
import classNames from 'classnames';
import { CardParams } from '@/shared/services/game/types'
import { CARD_MARGIN } from '@/shared/services/game/constants'
import styles from './styles.module.css'

type Props = {
  levelId: number,
  cardsParams: CardParams[]
  cardsMatched: number[],
  cardsValues: string[],
  onPause: () => void
}

const scenarios = [
  {
    id: 1,
    text: 'Нажмите на карту, чтобы увидеть ее цвет. Запоминайте расположение карт и найдите все пары. Отрывая пару карт, вы наносите урон противнику.'
  },
  {
    id: 2,
    text: 'Когда противник атакует, один из его элементов окрашивается в определенный цвет. Если вы нажмете на карту этого цвета, то отразите атаку и не получите урон.'
  },
  {
    id: 3,
    text: 'За каждый урон, нанесенный противнику, вы получаете энергию. Полученная энергия отображается на голубой колбе энергии.'
  },
  {
    id: 4,
    text: 'Противник так же атакует и наносит урон. Рядом с колбой энергии есть кнопка "сердечко", нажмите на нее что бы восстановить здоровье. Доведите бой до победного конца!'
  }
]

export const GameTrainingCards = ({
  levelId,
  cardsParams,
  cardsMatched,
  cardsValues,
  onPause
}: Props) => {
  const [step, setStep] = useState<number>(1)
  const [info, setInfo] = useState<string>(scenarios[0].text)
  const [cardsInfo, setCardsInfo] = useState<{index: number, value: string}[]>([])

  const handleCardInfo = (value: string) => {
    const indexes: number[] = [];

    for (let i = 0; i < cardsValues.length; i++) {
      if (cardsValues[i] === value) {
        indexes.push(i)

        if (indexes.length === 2) {
          setCardsInfo([
            { index: indexes[0], value: value },
            { index: indexes[1], value: value }
          ])
          return
        }
      }
    }

    setCardsInfo([])
  }

  useEffect(() => {
    let cardValue = cardsValues[0] !== 'card-5.png' ? cardsValues[0] : cardsValues[1]
    cardValue = cardValue !== 'card-5.png' ? cardValue : cardsValues[2]
    if (cardsInfo.length === 0) {
      handleCardInfo(cardValue)
    }
  }, [cardsValues])

  useEffect(() => {
    if (step === 1) {
      setStep(2)
      setInfo(scenarios[0].text)
      return
    }
    if (step === 2 && cardsMatched.length > 0 && cardsMatched.length === cardsInfo.length) {
      setStep(3)
      setInfo(scenarios[1].text)
      handleCardInfo('card-5.png')
      onPause()
    }
    if (step === 3 && cardsMatched.length === 4) {
      setStep(4)
      setInfo(scenarios[2].text)
      setCardsInfo(cardsValues.map((value, index) => ({ index, value })))
      return
    }
    if (step === 4) {
      setStep(5)
      setInfo(scenarios[3].text)
      onPause()
    }
  }, [cardsMatched])

  return (
    <div className={styles['game-training-cards']}>
      <div className={styles['game-training-cards-info']}>
        {info}
      </div>
      { cardsParams.map((data, index) => {
        const cardStyle = {
          top: `${data.y - CARD_MARGIN/2}px`,
          left: `${data.x - CARD_MARGIN/2}px`,
          width: `${data.width + CARD_MARGIN}px`,
          height: `${data.height + CARD_MARGIN}px`,
        };

        return (
          <div 
            key={`${levelId}-${data.x}-${data.y}`}
            className={
              classNames(
                styles['game-training-cards-item'],
                { [styles['game-training-cards-item_matched']]: cardsMatched.includes(index) },
                { [styles['game-training-cards-item_info']]: cardsInfo.some(card => card.index === index) }
              )
            } 
            style={cardStyle}
          ></div>
        )
      })}
    </div>
  )
}
