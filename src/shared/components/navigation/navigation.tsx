import styles from './styles.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { useProgress, useMusic } from '@/shared/hooks'

const Item = ({
  to,
  title,
  isActive = false,
}: {
  to: string
  title: string
  isActive?: boolean
}) => {
  const soundClick = useMusic({ src: './music/click.mp3', type: 'effect' })
  const navigate = useNavigate()
  const handleClick = () => {
    soundClick.play()
    setTimeout(() => navigate(to), 100)
  }
  return (
    <li
      className={classNames('', { [styles.active]: isActive })}
      onClick={handleClick}>
      {title}
    </li>
  )
}

export const Navigation = () => {
  const { userScore } = useProgress()

  const isNewGame = userScore === 0

  return (
    <ul className={styles.root}>
      {isNewGame ? <Item to="/intro" title="Новая игра" /> : <Item to="/levels" title="Продолжить" />}
      <Item to="/intro" title="Вступление" />
      <Item to="/arcade" title="Быстрая игра" />
      <Item to="/game-pvp" title="PVP" />
    </ul>
  )
}
