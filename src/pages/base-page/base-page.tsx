import classNames from 'classnames'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, UserTreasures } from '@/shared/components'
import { useProgress } from '@/shared/hooks/useProgress'
import imgBarmanDefault from '/base/default.webp'
import imgBarmanTalk from '/base/talk.webp'
import styles from './styles.module.css'

type MenuMode = 'main' | 'question1' | 'question2' | 'question3'
type MenuItem = { to: string; title: string; isActive?: boolean }

const MENU: Array<MenuItem> = [
  { to: 'question1', title: 'Где я?' },
  { to: 'question2', title: 'Как вернуться на Землю?' },
  { to: 'question3', title: 'Этот мир опасен?' },
  { to: '/levels', title: 'Выход' }
]

export const BasePage = () => {
  const navigate = useNavigate()
  const [menu, setMenu] = useState(MENU)
  const [mode, setMode] = useState('main')
  const [talk, setTalk] = useState(false)
  const [blink, setBlink] = useState('привет')
  const { selectLevel } = useProgress()
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink('(–)     (–)')

      setTimeout(() => {
        setBlink('(+)     (+)')
      }, 500)

    }, 5000)

    return () => clearInterval(interval)
  }, []);
  
  const handleTraining = () => {
    console.log('training')
    selectLevel(0)
    navigate('/game-battle', {})
  }

  const scrollUp = () => {
    scrollRef.current.scrollBy({
      top: -64,
      behavior: "smooth"
    })
  }

  const scrollDown = () => {
    scrollRef.current.scrollBy({
      top: 64,
      behavior: "smooth"
    })
  }

  const NavigationItem = ({
    to,
    title,
    isActive = false,
  }: {
    to?: string
    title: string
    isActive?: boolean
  }) => {
    const ACTIONS: Record<MenuMode, () => void> = {
      question1: () => {
        setMode('question1')
        setMenu([
          { to: 'question1', title: 'Где я?', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      question2: () => {
        setMode('question2')
        setMenu([
          { to: 'question2', title: 'Как вернуться на Землю?', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      question3: () => {
        setMode('question3')
        setMenu([
          { to: 'question3', title: 'Этот мир опасен?', isActive: true },
          { to: 'main', title: 'Назад' }
        ])
      },
      main: () => {
        setMode('main')
        setMenu(MENU)
      },
    }

    const onClick = () => {
      setTalk(true)
      setTimeout(() => setTalk(false), 1000)
      const action = ACTIONS[to as MenuMode]
      if (action) return action()

      navigate(to)
    }
    return (
      <li
        className={classNames('', { [styles.active]: isActive })}
        onClick={onClick}>
        {title}
      </li>
    )
  }

  const Navigation = () => {
    return (
      <ul className={styles.navigation}>
        {menu.map((item, index) => (
          <NavigationItem key={index} to={item.to} title={item.title} isActive={item.isActive} />
        ))}
      </ul>
    )
  }
    
  return (
    <main className={styles['base-page']}>
      <div className={classNames(
        styles['base-page__wrap'],
        styles[`base-page__wrap_${mode}`],
      )}>
        <Navigation/>

        { mode === 'question1' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            <p>
              Идентификация… неизвестный пользователь...<br />
              Вы находитесь на планете «Земля-7», объекте «Сектор-3».
              Данная база выведена из эксплуатации. Персонал эвакуирован согласно протоколу 4 года назад.
            </p>
            <p>
              Основной комплекс перенесён в сейсмоактивную зону данной планеты, на значительном удалении от текущих координат.
              Связь с новым объектом нестабильна или отсутствует.<br />
              Причина эвакуаци... данные засекречены.
            </p>
            <p>
              Рекомендация: пройдите обучение для получения базовых навыков выживания на «Земле-7».
            </p>
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => handleTraining()}>
            Обучение
          </Button>
        </div> }

         { mode === 'question2' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            <p>
              Запрос принят: возвращение на Землю.<br />
              Прямой маршрут недоступен. Транспортные модули на объекте «Сектор-3» выведены из эксплуатации.
            </p>
            <p>
              Для возврата требуется доступ к действующему космическому комплексу.<br />
              Ближайший функционирующий объект расположен в сейсмоактивной зоне данной планеты.<br />
              Расстояние превышает безопасный пеший маршрут.
            </p>
            <p>
              Дополнительная информация: доступна карта местности.<br />
              Карта содержит основные ориентиры, точки интереса и возможные маршруты передвижения.
            </p>
            <p>
              Обнаружен активный объект: «Таверна».<br />
              Данный тип сооружения используется для временного укрытия, восстановления и взаимодействия с другими выжившими.
            </p>
            <p>
              Рекомендация: пройдите подготовку по выживанию, изучите карту и направляйтесь к ближайшей «Таверне».<br />
              Вероятность успешного возвращения… неизвестна.
            </p>
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => handleTraining()}>
            Обучение
          </Button>
        </div> }

        { mode === 'question3' && <div className={styles['base-page__question']}>
          <button className={styles['base-page__question-up']} onClick={scrollUp}></button>
          <div className={styles['base-page__question-scroll']} ref={scrollRef}>
            <p>
              Запрос принят: уровень опасности.<br />
              Планета «Земля-7» классифицирована как условно опасная среда.<br />
              Уровень кислорода в водухе 10–12%, дыхание рекомендуется с использованием фильтров или в герметичных костюмах.<br />
              Зафиксированы формы жизни с нестабильным поведенческим паттерном.
            </p>
            <p>
              Все обнаруженные существа обладают кристаллическими структурами различного спектра.<br />
              Их реакции зависят от взаимодействия с кристаллами других цветов.<br />
              Прогноз поведения без анализа - невозможен.
            </p>
            <p>
              Для оценки взаимодействий используется портативное устройство: планшет.<br />
              Рекомендация: пройдите обучение и используйте планшет перед контактом.<br />
              Игнорирование протокола повышает риск... критически.
            </p>
          </div>
          <button className={styles['base-page__question-down']} onClick={scrollDown}></button>
          <Button onClick={() => handleTraining()}>
            Обучение
          </Button>
        </div> }

        <div className={styles['base-page__barman']}>
          <img src={talk ? imgBarmanTalk : imgBarmanDefault} />

          {mode === 'main' && 
            <p className={styles['base-page__barman-text-baloon']}>
              {blink}
            </p>}

          {mode === 'question1' && 
            <p className={styles['base-page__barman-text-baloon']}>
              find(a);
            </p>}

          {mode === 'question2' && 
            <p className={styles['base-page__barman-text-baloon']}>
              <span style={{ fontSize: '20px' }}>hello world!</span>
            </p>}

          {mode === 'question3' && 
            <p className={styles['base-page__barman-text-baloon']}>
              alert(c);
            </p>}
        </div>

        <UserTreasures/>
      </div>
    </main>
  )
}
