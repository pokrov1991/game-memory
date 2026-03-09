import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProgress } from '@/shared/hooks/useProgress';
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
  userLevelParams: {
    hp: number;
    guard: number;
    attack: number;
  };
  userScore: number;
  userCoins: number;
  userPotions: number;
  userParams: {
    hp: number;      // Здоровье игрока
    guard: number;   // Процент уменьшения урона от врага
    attack: number;  // Процент увеличения атаки от экипировки
  };
  userInventory: [
    {
      id: number;
      type: string;
      name: string;
      desc: string;
      price: number;
      organs: Array<{ id: number; name: string; count: number }>;
      hp: number;
      isPaid: boolean;
      isDressed: boolean;
    }
  ];
  userOrgans: {
    [key: number]: {
      id: number;
      name: string;
      count: number;
    };
  };
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
  const { setProgress } = useProgress()

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
        setProgress(gameData);

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
