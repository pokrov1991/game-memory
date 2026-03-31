import styles from './styles.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '@/shared/hooks'

const Item = ({
  to,
  title,
  isActive = false,
}: {
  to: string
  title: string
  isActive?: boolean
}) => {
  const navigate = useNavigate()
  return (
    <li
      className={classNames('', { [styles.active]: isActive })}
      onClick={() => navigate(to)}>
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
      {/* <Item to="/leader-board" title="Лидеры" /> */}
    </ul>
  )
}
