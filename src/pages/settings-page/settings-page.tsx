import classNames from 'classnames'
import { Layout, Navigate, Button } from '@/shared/components'
import styles from './styles.module.css'

const routes = [
  {
    path: '/',
    name: 'Назад',
    sort: 20,
  },
  {
    path: '/settings',
    name: 'Настройки',
    sort: 10,
  },
]

const LANGUAGE = [
  { id: 1, name: 'English' },
  { id: 2, name: '中國人' },
  { id: 3, name: 'Русский' }
]

export const SettingsPage = () => {
  const handleSave = () => {
    console.log('Сохранить настройки')
  }

  const selectLang = (id: number) => {
    console.log('Выбрать язык')
  }

  return (
    <main className={styles['settings-page']}>
      <Layout title="Настройки">
        <div className={styles['settings-page__container']}>

          <div className={styles['settings-page__navigation']}>
            <Navigate routes={routes} />
          </div>

          <section className={styles['settings-page__section']}>
            <h2>Выбрать язык</h2>

            <div className={styles['settings-page-list']}>
              {LANGUAGE.map((lang) => {
                return (
                  <div className={styles['settings-page-list-item']} onClick={() => {
                    selectLang(lang.id)
                  }} key={lang.id}>
                    <b>{lang.name}</b>
                  </div>)
              })}
            </div>
          </section>

          <section className={styles['settings-page__section']}>
            <h2>Громкость</h2>

            <div className={styles['settings-page__counters']}>
              <div className={styles['settings-page__counter']}>
                <div className={styles['settings-page__counter-name']}>Фон</div>
                <div className={styles['settings-page__counter-controls']}>
                  <button onClick={() => {}} disabled={true}>-</button>
                  <span>100</span>
                  <button onClick={() => {}} disabled={false}>+</button>
                </div>
              </div>

              <div className={styles['settings-page__counter']}>
                <div className={styles['settings-page__counter-name']}>Эффекты</div>
                <div className={styles['settings-page__counter-controls']}>
                  <button onClick={() => {}} disabled={true}>-</button>
                  <span>100</span>
                  <button onClick={() => {}} disabled={false}>+</button>
                </div>
              </div>
            </div>
            
            <Button type="button" onClick={handleSave}>
              Сохранить
            </Button>
          </section>
        </div>
      </Layout>
    </main>
  )
}
