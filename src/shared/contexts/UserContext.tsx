import React, { createContext, useContext, useState, useEffect } from 'react';
import YandexSDK from '@/shared/services/sdk/yandexSdk';

interface UserData {
  id: string;
  name: string;
  avatar: string;
  mode: string;
}

interface GameData {
  completedLevels: number[];
  selectedLevel: number;
  userLevel: number;
  userScore: number;
  userCoins: number;
  userHelmet: number;
}

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

  useEffect(() => {
    async function fetchUser() {
      try {
        await YandexSDK.init(); // Инициализация SDK
        const userData = await YandexSDK.getUserData();
        console.log("Данные игрока:", userData);
        setUser(userData);

        // await YandexSDK.authUser(); // Проверка авторизации

        const gameData = await YandexSDK.getGameData();
        console.log("Данные игры:", gameData);
        setGame(gameData);

        // await YandexSDK.showAd(); // Показ рекламы
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
