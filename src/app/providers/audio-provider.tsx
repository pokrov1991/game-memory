import { createContext, useContext, useState } from 'react'

interface AudioContextValue {
  isMuted: boolean
  audioUnlocked: boolean
  musicVolume: number
  effectsVolume: number
  setMusicVolume: (volume: number) => void
  setEffectsVolume: (volume: number) => void
  toggleMute: () => void
  unlockAudio: () => void
}

const AudioContext = createContext<AudioContextValue | null>(null)
const normalizeVolume = (volume: number) => Math.min(100, Math.max(0, volume))

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [musicVolume, setMusicVolumeState] = useState(100)
  const [effectsVolume, setEffectsVolumeState] = useState(100)

  const toggleMute = () => {
    setIsMuted(prev => !prev)
  }

  const unlockAudio = () => {
    setAudioUnlocked(true)
  }

  const setMusicVolume = (volume: number) => {
    setMusicVolumeState(normalizeVolume(volume))
  }

  const setEffectsVolume = (volume: number) => {
    setEffectsVolumeState(normalizeVolume(volume))
  }

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        audioUnlocked,
        musicVolume,
        effectsVolume,
        setMusicVolume,
        setEffectsVolume,
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
