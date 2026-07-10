import styles from './styles.module.css'
import classNames from 'classnames'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress, useMusic } from '@/shared/hooks'
import { InputField } from '@/shared/components/input-field'
import { ModalDefault } from '@/shared/components/modal-comps'
import { useUser } from '@/shared/contexts/UserContext'
import { useI18n } from '@/shared/services/i18n'
import {
  createDefaultGameProgress,
  hasStartedCampaign,
  platformApi,
  readLocalPlayerName,
  writeLocalPlayerName,
} from '@/shared/services/platform'

const Item = ({
  to,
  title,
  sup,
  onSelect,
  isActive = false,
}: {
  to?: string
  title: string
  sup?: string
  onSelect?: () => void
  isActive?: boolean
}) => {
  const soundClick = useMusic({ src: './music/click.mp3', type: 'effect' })
  const navigate = useNavigate()
  const handleClick = () => {
    soundClick.play()
    setTimeout(() => {
      if (onSelect) {
        onSelect()
        return
      }

      if (to) {
        navigate(to)
      }
    }, 100)
  }

  return (
    <li
      className={classNames('', { [styles.active]: isActive })}
      onClick={handleClick}>
      {title}
      {sup ? <sup>{sup}</sup> : ''}
    </li>
  )
}

export const Navigation = () => {
  const { t } = useI18n()
  const { progress, setProgress } = useProgress()
  const { setUser, setGame } = useUser()
  const navigate = useNavigate()
  const [isOpenPlayerNameModal, setOpenPlayerNameModal] = useState(false)
  const [isOpenNewGameModal, setOpenNewGameModal] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerNameError, setPlayerNameError] = useState<string | null>(null)
  const [pendingPath, setPendingPath] = useState<string | null>(null)

  const isStartedCampaign = hasStartedCampaign(progress)
  const isLocalPlatform = platformApi.kind === 'local' || platformApi.kind === 'desktop'
  const isPvpAvailable = isLocalPlatform || platformApi.kind === 'steam'
  const isExitAvailable = platformApi.kind === 'desktop' || platformApi.kind === 'steam'
  const normalizedPlayerName = playerName.trim()

  const navigateTo = (path: string) => {
    navigate(path)
  }

  const handlePlayerNameRequiredNavigate = (path: string) => {
    if (!isLocalPlatform || readLocalPlayerName()) {
      navigateTo(path)
      return
    }

    setPendingPath(path)
    setPlayerName('')
    setPlayerNameError(null)
    setOpenPlayerNameModal(true)
  }

  const handleSavePlayerName = async () => {
    if (!normalizedPlayerName) {
      setPlayerNameError(t('navigation.playerName.errorRequired'))
      return
    }

    // TODO - возможно надо открыть, что бы имя было уникально
    // const isNameAvailable = await platformApi.isPlayerNameAvailable?.(normalizedPlayerName)

    // if (isLocalPlatform && !isNameAvailable) {
    //   setPlayerNameError('Имя уже занято')
    //   return
    // }

    writeLocalPlayerName(normalizedPlayerName)
    setUser(await platformApi.getUserData())
    setOpenPlayerNameModal(false)

    if (pendingPath) {
      navigateTo(pendingPath)
      setPendingPath(null)
    }
  }

  const handleNewGame = () => {
    if (!isStartedCampaign) {
      navigateTo('/intro')
      return
    }

    setOpenNewGameModal(true)
  }

  const handleSettings = () => {
    navigateTo('/settings')
  }

  const handleExit = () => {
    window.desktopApi?.quit()
  }

  const handleResetProgress = async () => {
    const defaultProgress = createDefaultGameProgress()

    await platformApi.setGameData(defaultProgress)
    setProgress(defaultProgress)
    setGame(defaultProgress)
    setOpenNewGameModal(false)
    navigateTo('/intro')
  }

  return (
    <>
      <ul className={styles.root}>
        <Item title={t('mainMenu.newGame')} onSelect={handleNewGame} />
        {isStartedCampaign && <Item to="/levels" title={t('mainMenu.continue')} />}
        {/* <Item to="/intro" title="Вступление" /> */}
        <Item title={t('mainMenu.quickGame')} onSelect={() => handlePlayerNameRequiredNavigate('/arcade')} />
        {isPvpAvailable && (
          <Item title={t('mainMenu.pvpGame')} sup="Beta" onSelect={() => handlePlayerNameRequiredNavigate('/pvp')} />
        )}
        <Item title={t('mainMenu.settings')} onSelect={handleSettings} />
        {isExitAvailable && <Item title={t('common.exit')} onSelect={handleExit} />}
      </ul>
      <ModalDefault
        title={t('navigation.playerName.title')}
        info={(
          <InputField
            label={t('navigation.playerName.label')}
            type="text"
            error={playerNameError}
            value={playerName}
            name="playerName"
            icon="ui/icons/magic.svg"
            onChange={(event) => {
              setPlayerName(event.target.value)
              setPlayerNameError(null)
            }}
            onBlur={() => {
              if (playerName && !normalizedPlayerName) {
                setPlayerNameError(t('navigation.playerName.errorRequired'))
              }
            }}
          />
        )}
        buttonSuccess={t('common.save')}
        buttonCancel={t('common.cancel')}
        isButtonSuccessDisabled={!normalizedPlayerName}
        onContinue={handleSavePlayerName}
        onExit={() => setOpenPlayerNameModal(false)}
        isOpened={isOpenPlayerNameModal}
      />
      <ModalDefault
        title={t('navigation.newGame.title')}
        subtitle={t('navigation.newGame.subtitle')}
        buttonSuccess={t('navigation.newGame.confirm')}
        buttonCancel={t('common.cancel')}
        onContinue={handleResetProgress}
        onExit={() => setOpenNewGameModal(false)}
        isOpened={isOpenNewGameModal}
      />
    </>
  )
}
