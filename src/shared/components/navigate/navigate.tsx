import styles from './styles.module.css'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

type Props = {
  routes: Array<{
    path: string
    name: string
    sort: number
  }>
}

const branchPic = '/ui/pics/branch-pic.svg'

export const Navigate = ({ routes }: Props) => {
  const links = routes
    .sort((a, b) => a.sort - b.sort)
    .map(route => (
      <NavLink
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
