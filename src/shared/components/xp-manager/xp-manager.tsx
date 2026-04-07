import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useProgress } from '@/shared/hooks'
import { Button } from '@/shared/components'
import YandexSDK from '@/shared/services/sdk/yandexSdk'
import styles from './styles.module.css'

const UNIT_HP = 5
const UNIT_GUARD = 0.5
const UNIT_ATTACK = 0.5
const USER_PARAMS_DEFAULT = {
  hp: 100,
  guard: 1,
  attack: 1
}

export const XpManager = () => {
  const { progress, userLevel, userLevelParams, userParams, paramsUp, levelParamsUp } = useProgress()
  const [countLevel, setCountLevel] = useState(userLevel - userLevelParams.hp - userLevelParams.guard - userLevelParams.attack)
  const [countHp, setCountHp] = useState(userLevelParams.hp)
  const [countGuard, setCountGuard] = useState(userLevelParams.guard)
  const [countAttack, setCountAttack] = useState(userLevelParams.attack)
  const [hp, setHp] = useState(userParams.hp)
  const [guard, setGuard] = useState(userParams.guard)
  const [attack, setAttack] = useState(userParams.attack)
  const [isDisabled, setDisabled] = useState(true)

  const syncProgress = async () => {
    await YandexSDK.setGameData({...progress, userParams, userLevelParams})
  }

  useEffect(() => {
    setHp(USER_PARAMS_DEFAULT.hp + countHp * UNIT_HP)
  }, [countHp])

  useEffect(() => {
    setGuard(USER_PARAMS_DEFAULT.guard + countGuard * UNIT_GUARD)
  }, [countGuard])

  useEffect(() => {
    setAttack(USER_PARAMS_DEFAULT.attack + countAttack * UNIT_ATTACK)
  }, [countAttack])

  useEffect(() => {
    const isSameParams =
      countHp === userLevelParams.hp &&
      countGuard === userLevelParams.guard &&
      countAttack === userLevelParams.attack

    setDisabled(isSameParams)
  }, [countHp, countGuard, countAttack, userLevelParams])

  useEffect(() => {
    syncProgress()
    setDisabled(true)
  }, [userParams])

  return (
    <div className={styles['xp-manager']}>
      <div className={styles['xp-manager__info']}>
        <div className={styles['xp-manager__info-level']}>Сферы:<b>{countLevel}</b></div>
        <div className={styles['xp-manager__info-params']}>
          <span>Здоровье: <b>{hp}</b></span>
          <span>Защита: <b>{guard}</b></span>
          <span>Атака: <b>{attack}</b></span>
        </div>
        <div className={styles['xp-manager__info-actions']}>
          <Button 
            onClick={() => {
              levelParamsUp({ hp: countHp, guard: countGuard, attack: countAttack })
              paramsUp({ hp: hp, guard: guard, attack: attack })
            }} 
            disabled={isDisabled}>
            Сохранить
          </Button>
        </div>
      </div>
      <div className={styles['xp-manager__control']}>
        <div className={classNames(styles['xp-manager__counter'], styles['xp-manager__counter_hp'])}>
          <div className={styles['xp-manager__counter-name']}>Здоровье</div>
          <div className={styles['xp-manager__counter-controls']}>
            <button onClick={() => {
              setCountHp(countHp - 1)
              setCountLevel(countLevel + 1)
            }} disabled={countHp <= 0}>-</button>
            <span>{countHp}</span>
            <button onClick={() => {
              setCountHp(countHp + 1)
              setCountLevel(countLevel - 1)
            }} disabled={countLevel <= 0}>+</button>
          </div>
          <div className={styles['xp-manager__counter-units']}>+{UNIT_HP} ед.</div>
        </div>

        <div className={classNames(styles['xp-manager__counter'], styles['xp-manager__counter_guard'])}>
          <div className={styles['xp-manager__counter-name']}>Защита</div>
          <div className={styles['xp-manager__counter-controls']}>
            <button onClick={() => {
              setCountGuard(countGuard - 1)
              setCountLevel(countLevel + 1)
            }} disabled={countGuard <= 0}>-</button>
            <span>{countGuard}</span>
            <button onClick={() => {
              setCountGuard(countGuard + 1)
              setCountLevel(countLevel - 1)
            }} disabled={countLevel <= 0}>+</button>
          </div>
          <div className={styles['xp-manager__counter-units']}>+{UNIT_GUARD} ед.</div>
        </div>

        <div className={classNames(styles['xp-manager__counter'], styles['xp-manager__counter_attack'])}>
          <div className={styles['xp-manager__counter-name']}>Атака</div>
          <div className={styles['xp-manager__counter-controls']}>
            <button onClick={() => {
              setCountAttack(countAttack - 1)
              setCountLevel(countLevel + 1)
            }} disabled={countAttack <= 0}>-</button>
            <span>{countAttack}</span>
            <button onClick={() => {
              setCountAttack(countAttack + 1)
              setCountLevel(countLevel - 1)
            }} disabled={countLevel <= 0}>+</button>
          </div>
          <div className={styles['xp-manager__counter-units']}>+{UNIT_ATTACK} ед.</div>
        </div>
      </div>
    </div>
  )
}
