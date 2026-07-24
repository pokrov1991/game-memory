import { Button } from '@/shared/components'
import { openSteamPage } from '@/shared/components/full-version-modal'
import styles from './styles.module.css'

const FULL_VERSION_FEATURES = [
  'Full story campaign',
  'All enemies',
  'Complete arcade mode',
  'Online PvP',
  'Equipment upgrades',
  'Achievements',
]

export const DemoCompletedPage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.badge}>Orion-7 Demo</p>
        <h1>Orion-7 Demo Complete</h1>
        <h2>Thank you for playing Orion-7!</h2>
        <p>You have completed the opening chapter.</p>
        <p>The full version includes:</p>
        <ul>
          {FULL_VERSION_FEATURES.map(feature => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p>Wishlist / Buy on Steam:</p>
        <Button onClick={openSteamPage}>Open Steam</Button>
      </section>
    </main>
  )
}
