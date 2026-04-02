import classNames from 'classnames'
import bgItem from '/ui/level-map/Item.png'
import styles from './styles.module.css'

type Props = {
  id: number
  isPassed: boolean
  isCurrent: boolean
  x: number
  y: number
  onClick: (level: number) => void
}

export const Item = ({ id, x, y, isCurrent, isPassed, onClick }: Props) => (
  <div 
    className={classNames(styles.item,
      styles[`item_${id}`], {
      [styles.current]: isCurrent,
      [styles.passed]: isPassed,
    })}
    style={{ left: `calc(${x}% - 58px)`, bottom: `calc(${y}% - 51px)` }} 
    onClick={() => onClick(id)}
  >
    <b>{id}</b>
    <img src={bgItem}/>
  </div>
)
