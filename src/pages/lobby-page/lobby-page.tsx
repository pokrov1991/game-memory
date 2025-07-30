import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const LobbyPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    async function get() {
      const response = await fetch('http://localhost:3000/online-game', {
        method: 'POST',
      })
      const data = await response.json()
      const hash = data.roomHash
  
      navigate(`/game-online/${hash}`)
    }

    get()
  }, [])

  return ('')
}
