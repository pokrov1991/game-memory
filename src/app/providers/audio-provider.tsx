import { createContext, useContext, useState } from 'react'

interface AudioContextValue {
  isMuted: boolean
  audioUnlocked: boolean
  toggleMute: () => void
  unlockAudio: () => void
}

const AudioContext = createContext<AudioContextValue | null>(null)

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  const toggleMute = () => {
    setIsMuted(prev => !prev)
  }

  const unlockAudio = () => {
    setAudioUnlocked(true)
  }

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        audioUnlocked,
        toggleMute,
        unlockAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)

  if (!context) {
    throw new Error('useAudio должен использоваться внутри AudioProvider')
  }

  return context
}