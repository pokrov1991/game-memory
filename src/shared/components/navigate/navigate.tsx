import classNames from 'classnames'
import { useNavigate, NavLink } from 'react-router-dom'
import { useMusic } from '@/shared/hooks'
import styles from './styles.module.css'

type Props = {
  routes: Array<{
    path: string
    name: string
    sort: number
  }>
}

const branchPic = 'ui/pics/branch-pic.svg'

export const Navigate = ({ routes }: Props) => {
  const navigate = useNavigate()
  const soundClick = useMusic({ src: './music/click.mp3', type: 'effect' })
  const handleClick = (event: { preventDefault: () => void }, to: string) => {
    event.preventDefault();
    soundClick.play()
    setTimeout(() => navigate(to), 100)
  }

  const links = routes
    .sort((a, b) => a.sort - b.sort)
    .map(route => (
      <NavLink
        onClick={(e) => handleClick(e, route.path)}
        to={route.path}
        key={route.path}
        className={({ isActive }) =>
          isActive
            ? classNames(styles.link, styles.active)
            : classNames(styles.link)
        }>
        {route.name}
      </NavLink>
    ))
  return (
    <div className={styles.root}>
      <img src={branchPic} className={styles.pic} />
      <nav className={styles.nav}>{links}</nav>
    </div>
  )
}
