import { Button as Default, ButtonProps } from '@mui/material'
import styles from './styles.module.css'

export const Button = ({ children, ...props }: ButtonProps) => (
  <Default className={styles.button} {...props}>
    <span className={styles.text}>
      {children}
    </span>
  </Default>
)
