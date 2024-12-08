import { useState } from 'react'
import classNames from 'classnames';
import { CardParams } from '@/shared/services/game/types'
import { CARD_MARGIN } from '@/shared/services/game/constants'
import styles from './styles.module.css'

type Props = {
  levelId: number,
  cardsParams: CardParams[]
  cardsMatched: number[]
}

export const GameEffectsCards = ({
  levelId,
  cardsParams,
  cardsMatched
}: Props) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoveredCard(index)
  };

  const handleMouseLeave = () => {
    setHoveredCard(null)
  };

  return (
    <div className={styles['game-effects-cards']}>
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
                styles['game-effects-cards-item'],
                { [styles['game-effects-cards-item_hover']]: hoveredCard === index },
                { [styles['game-effects-cards-item_matched']]: cardsMatched.includes(index) }
              )
            } 
            style={cardStyle}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          ></div>
        )
      })}
    </div>
  )
}
