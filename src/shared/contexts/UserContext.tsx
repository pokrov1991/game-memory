import React, { createContext, useContext, useState, useEffect } from 'react';
import YandexSDK from '../../services/yandexSdk';

interface UserData {
  id: string;
  name: string;
  avatar: string;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        await YandexSDK.init(); // Инициализация SDK
        const userData = await YandexSDK.getUserData(); // Получение данных пользователя
        console.log("Данные игрока:", userData);
        setUser(userData);
        await YandexSDK.authUser();
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
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
