import { useState, useEffect } from 'react'
import classNames from 'classnames';
import { CardParams } from '@/shared/services/game/types'
import { CARD_MARGIN } from '@/shared/services/game/constants'
import { useI18n } from '@/shared/services/i18n'
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
    textKey: 'training.cards.one'
  },
  {
    id: 2,
    textKey: 'training.cards.two'
  },
  {
    id: 3,
    textKey: 'training.cards.three'
  },
  {
    id: 4,
    textKey: 'training.cards.four'
  }
]

export const GameTrainingCards = ({
  levelId,
  cardsParams,
  cardsMatched,
  cardsValues,
  onPause
}: Props) => {
  const { t } = useI18n()
  const [step, setStep] = useState<number>(1)
  const [infoKey, setInfoKey] = useState<string>(scenarios[0].textKey)
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
      setInfoKey(scenarios[0].textKey)
      return
    }
    if (step === 2 && cardsMatched.length > 0 && cardsMatched.length === cardsInfo.length) {
      setStep(3)
      setInfoKey(scenarios[1].textKey)
      handleCardInfo('card-5.png')
      onPause()
    }
    if (step === 3 && cardsMatched.length === 4) {
      setStep(4)
      setInfoKey(scenarios[2].textKey)
      setCardsInfo(cardsValues.map((value, index) => ({ index, value })))
      return
    }
    if (step === 4) {
      setStep(5)
      setInfoKey(scenarios[3].textKey)
      onPause()
    }
  }, [cardsMatched])

  return (
    <div className={styles['game-training-cards']}>
      <div className={styles['game-training-cards-info']}>
        {t(infoKey)}
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
