import { ModalDefault } from '@/shared/components/modal-comps'
import { STEAM_STORE_URL } from '@/shared/config'

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
  return (
    <ModalDefault
      title="Available in the full version"
      subtitle="Continue your journey in Orion-7"
      info="Unlock the complete campaign and all game modes on Steam."
      buttonSuccess="Open Steam Page"
      buttonCancel="Close"
      onContinue={openSteamPage}
      onExit={onClose}
      isOpened={isOpened}
    />
  )
}
