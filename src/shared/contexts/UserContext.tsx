import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProgress } from '@/shared/hooks/useProgress';
import { useAudio } from '@/shared/hooks';
import { GameProgress, PlatformUser, platformApi } from '@/shared/services/platform';

type UserData = PlatformUser
type GameData = GameProgress

interface UserContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  game: GameData | null;
  setGame: React.Dispatch<React.SetStateAction<GameData | null>>;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => null,
  game: null,
  setGame: () => null,
  loading: true,
  error: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setProgress } = useProgress()
  const { setMusicVolume, setEffectsVolume } = useAudio()

  useEffect(() => {
    async function fetchUser() {
      try {
        await platformApi.init(); // Инициализация платформенного API
        const userData = await platformApi.getUserData();
        console.log("Данные игрока:", userData);
        setUser(userData);

        // await platformApi.authUser(); // Проверка авторизации

        const gameData = await platformApi.getGameData();
        console.log("Данные игры:", gameData);
        setGame(gameData);
        setProgress(gameData);
        setMusicVolume(gameData.settings.musicVolume)
        setEffectsVolume(gameData.settings.effectsVolume)

        // await platformApi.showAd(); // Показ рекламы
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки пользователя');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, game, setGame, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
