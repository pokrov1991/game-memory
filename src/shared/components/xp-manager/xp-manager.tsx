import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { useProgress } from '@/shared/hooks'
import { Button, FullVersionModal } from '@/shared/components'
import { platformApi } from '@/shared/services/platform'
import { useI18n } from '@/shared/services/i18n'
import styles from './styles.module.css'
import { gameFeatures } from '@/shared/config'

const UNIT_HP = 5
const UNIT_GUARD = 0.5
const UNIT_ATTACK = 0.5
const USER_PARAMS_DEFAULT = {
  hp: 100,
  guard: 1,
  attack: 1
}

export const XpManager = () => {
  const { t } = useI18n()
  const { progress, userLevel, userLevelParams, userParams, paramsUp, levelParamsUp } = useProgress()
  const [countLevel, setCountLevel] = useState(userLevel - userLevelParams.hp - userLevelParams.guard - userLevelParams.attack)
  const [countHp, setCountHp] = useState(userLevelParams.hp)
  const [countGuard, setCountGuard] = useState(userLevelParams.guard)
  const [countAttack, setCountAttack] = useState(userLevelParams.attack)
  const [hp, setHp] = useState(userParams.hp)
  const [guard, setGuard] = useState(userParams.guard)
  const [attack, setAttack] = useState(userParams.attack)
  const [isDisabled, setDisabled] = useState(true)
  const [isOpenFullVersionModal, setOpenFullVersionModal] = useState(false)

  const increaseParam = (
    value: number,
    setValue: (value: number) => void
  ) => {
    if (value >= gameFeatures.maxSkillTier) {
      setOpenFullVersionModal(true)
      return
    }

    setValue(value + 1)
    setCountLevel(countLevel - 1)
  }

  const syncProgress = async () => {
    await platformApi.setGameData({...progress, userParams, userLevelParams})
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
        <div className={styles['xp-manager__info-level']}>{t('xp.spheres')}:<b>{countLevel}</b></div>
        <div className={styles['xp-manager__info-params']}>
          <span>{t('xp.health')}: <b>{hp}</b></span>
          <span>{t('xp.guard')}: <b>{guard}</b></span>
          <span>{t('xp.attack')}: <b>{attack}</b></span>
        </div>
        <div className={styles['xp-manager__info-actions']}>
          <Button 
            onClick={() => {
              levelParamsUp({ hp: countHp, guard: countGuard, attack: countAttack })
              paramsUp({ hp: hp, guard: guard, attack: attack })
            }} 
            disabled={isDisabled}>
            {t('common.save')}
          </Button>
        </div>
      </div>
      <div className={styles['xp-manager__control']}>
        <div className={classNames(styles['xp-manager__counter'], styles['xp-manager__counter_hp'])}>
          <div className={styles['xp-manager__counter-name']}>{t('xp.health')}</div>
          <div className={styles['xp-manager__counter-controls']}>
            <button onClick={() => {
              setCountHp(countHp - 1)
              setCountLevel(countLevel + 1)
            }} disabled={countHp <= 0}>-</button>
            <span>{countHp}</span>
            <button onClick={() => {
              increaseParam(countHp, setCountHp)
            }} disabled={countLevel <= 0}>+</button>
          </div>
          <div className={styles['xp-manager__counter-units']}>+{UNIT_HP} {t('xp.unitSuffix')}</div>
        </div>

        <div className={classNames(styles['xp-manager__counter'], styles['xp-manager__counter_guard'])}>
          <div className={styles['xp-manager__counter-name']}>{t('xp.guard')}</div>
          <div className={styles['xp-manager__counter-controls']}>
            <button onClick={() => {
              setCountGuard(countGuard - 1)
              setCountLevel(countLevel + 1)
            }} disabled={countGuard <= 0}>-</button>
            <span>{countGuard}</span>
            <button onClick={() => {
              increaseParam(countGuard, setCountGuard)
            }} disabled={countLevel <= 0}>+</button>
          </div>
          <div className={styles['xp-manager__counter-units']}>+{UNIT_GUARD} {t('xp.unitSuffix')}</div>
        </div>

        <div className={classNames(styles['xp-manager__counter'], styles['xp-manager__counter_attack'])}>
          <div className={styles['xp-manager__counter-name']}>{t('xp.attack')}</div>
          <div className={styles['xp-manager__counter-controls']}>
            <button onClick={() => {
              setCountAttack(countAttack - 1)
              setCountLevel(countLevel + 1)
            }} disabled={countAttack <= 0}>-</button>
            <span>{countAttack}</span>
            <button onClick={() => {
              increaseParam(countAttack, setCountAttack)
            }} disabled={countLevel <= 0}>+</button>
          </div>
          <div className={styles['xp-manager__counter-units']}>+{UNIT_ATTACK} {t('xp.unitSuffix')}</div>
        </div>
      </div>
      <FullVersionModal
        isOpened={isOpenFullVersionModal}
        onClose={() => setOpenFullVersionModal(false)}
      />
    </div>
  )
}
