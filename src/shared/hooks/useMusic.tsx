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
let sharedAudioContext: AudioContext | null = null
const audioBuffers = new Map<string, AudioBuffer>()

type WebAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!sharedAudioContext) {
    const AudioContextConstructor = window.AudioContext || (window as WebAudioWindow).webkitAudioContext

    if (!AudioContextConstructor) {
      return null
    }

    sharedAudioContext = new AudioContextConstructor()
  }

  return sharedAudioContext
}

const loadAudioBuffer = async (src: string): Promise<AudioBuffer | null> => {
  if (audioBuffers.has(src)) {
    return audioBuffers.get(src) || null
  }

  const context = getAudioContext()

  if (!context) {
    return null
  }

  try {
    const response = await fetch(src)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = await context.decodeAudioData(arrayBuffer)
    audioBuffers.set(src, buffer)
    return buffer
  } catch {
    return null
  }
}

export const useMusic = ({
  src,
  loop = false,
  conditional = true,
  type = 'effect',
}: IMusicProps) => {
  const { isMuted, audioUnlocked } = useAudio()

  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioPoolRef = useRef<HTMLAudioElement[]>([])
  const audioPoolIndexRef = useRef(0)
  const bufferRef = useRef<AudioBuffer | null>(null)

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

  const playEffect = useCallback(() => {
    if (!conditional || !src || isMuted) return

    const context = getAudioContext()
    const buffer = bufferRef.current

    if (context && buffer) {
      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)

      if (context.state === 'suspended') {
        context.resume().catch(() => {})
      }

      try {
        source.start(0)
        return
      } catch {}
    }

    const pool = audioPoolRef.current
    const audio = pool[audioPoolIndexRef.current] || audioRef.current

    if (!audio) {
      return
    }

    audioPoolIndexRef.current = (audioPoolIndexRef.current + 1) % Math.max(pool.length, 1)
    audio.muted = isMuted

    try {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch {}
  }, [src, conditional, isMuted])

  useEffect(() => {
    if (type === 'theme') return

    let cancelled = false
    const pool = Array.from({ length: 4 }, () => {
      const audio = new Audio(src)
      audio.loop = loop
      audio.muted = isMuted
      audio.preload = 'auto'
      audio.load()
      return audio
    })

    audioPoolRef.current = pool
    audioRef.current = pool[0] || null

    loadAudioBuffer(src).then(buffer => {
      if (!cancelled) {
        bufferRef.current = buffer
      }
    })

    return () => {
      cancelled = true
      pool.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
      audioPoolRef.current = []
      audioRef.current = null
      bufferRef.current = null
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

    audioPoolRef.current.forEach(audio => {
      audio.muted = isMuted
    })
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
