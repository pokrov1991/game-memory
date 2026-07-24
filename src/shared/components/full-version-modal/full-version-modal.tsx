import { ModalDefault } from '@/shared/components/modal-comps'
import { STEAM_STORE_URL } from '@/shared/config'
import { useI18n } from '@/shared/services/i18n'

type FullVersionModalProps = {
  isOpened: boolean
  onClose(): void
}

export const openSteamPage = () => {
  window.open(STEAM_STORE_URL, '_blank', 'noopener,noreferrer')
}

export const FullVersionModal = ({
  isOpened,
  onClose,
}: FullVersionModalProps) => {
  const { t } = useI18n()

  return (
    <ModalDefault
      title={t('demo.fullVersion.title')}
      subtitle={t('demo.fullVersion.subtitle')}
      info={t('demo.fullVersion.info')}
      buttonSuccess={t('demo.fullVersion.button')}
      buttonCancel={t('demo.fullVersion.close')}
      onContinue={openSteamPage}
      onExit={onClose}
      isOpened={isOpened}
    />
  )
}
