import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudio } from '@/shared/hooks'

interface IMusicProps {
  src: string
  loop?: boolean
  conditional?: boolean
  type?: 'effect' | 'theme'
}

const themeAudio = new Audio()
let currentThemeSrc = ''

export const useMusic = ({
  src,
  loop = false,
  conditional = true,
  type = 'effect',
}: IMusicProps) => {
  const { isMuted, audioUnlocked } = useAudio()

  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playTheme = useCallback(async () => {
    if (!audioUnlocked || !conditional || !src) return

    themeAudio.muted = isMuted
    themeAudio.loop = loop

    if (currentThemeSrc !== src) {
      themeAudio.pause()
      themeAudio.src = src
      themeAudio.currentTime = 0
      currentThemeSrc = src
    }

    try {
      await themeAudio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }, [src, loop, conditional, isMuted, audioUnlocked])

  const stopTheme = useCallback(() => {
    themeAudio.pause()
    setIsPlaying(false)
  }, [])

  const playEffect = useCallback(async () => {
    if (!audioRef.current || !conditional || !src) return

    audioRef.current.muted = isMuted

    try {
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    } catch {}
  }, [src, conditional, isMuted])

  useEffect(() => {
    if (type === 'theme') return

    const audio = new Audio(src)
    audio.loop = loop
    audio.muted = isMuted

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [src, loop, isMuted, type])

  useEffect(() => {
    if (type !== 'theme') return

    if (conditional) {
      playTheme()
    } else {
      stopTheme()
    }
  }, [type, conditional, playTheme, stopTheme])

  useEffect(() => {
    if (type === 'theme') {
      themeAudio.muted = isMuted
    }

    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted, type])

  const play = useCallback(() => {
    if (type === 'theme') {
      playTheme()
      return
    }

    playEffect()
  }, [type, playTheme, playEffect])

  const stop = useCallback(() => {
    if (type === 'theme') {
      stopTheme()
      return
    }

    audioRef.current?.pause()
  }, [type, stopTheme])

  return {
    play,
    stop,
    isPlaying,
  }
}