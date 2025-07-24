import styles from './styles.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '@/shared/hooks'
import { useUser } from '@/shared/contexts/UserContext'

const Item = ({
  to,
  title,
  isActive = false,
  onClick,
}: {
  to: string
  title: string
  isActive?: boolean
  onClick?: () => void
}) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    onClick ? onClick() : navigate(to)
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
  const navigate = useNavigate()
  const { game } = useUser()
  const { userLevel } = useProgress()

  const cUserLevel = userLevel > 1 ? userLevel : game?.userLevel
  const isNewGame = cUserLevel <= 1

  const handleOnlineGame = async () => {
    const response = await fetch('http://localhost:3000/online-game', {
      method: 'POST',
    })
    const data = await response.json()
    const hash = data.roomHash

    navigate(`/game-battle/${hash}`)
  }

  return (
    <ul className={styles.root}>
      <Item to="/levels" title={isNewGame ? 'Новая игра' : 'Продолжить'} />
      <Item to="/leader-board" title="Лидеры" />
      <Item to={`/game-battle`} onClick={handleOnlineGame} title="Играть онлайн" />
    </ul>
  )
}
