import SDK from './sdk';
import { ensureYsdk } from '@/shared/decorators/ensureYsdk';
import { IYandexSDK, IPlayer } from '@/types';

declare global {
  interface Window {
    YaGames: {
      init: () => Promise<IYandexSDK>;
    };
  }
}

export default class YandexSDK extends SDK {
    static _ysdk: IYandexSDK | null = null;
    static _player: IPlayer | null = null;
  
    static async init() {
      if (window.YaGames) {
        try {
          this._ysdk = await window.YaGames.init();
          this._initialized = true;
          console.log("Яндекс SDK успешно инициализирован");
        } catch (error) {
            throw new Error("Ошибка инициализации Яндекс SDK: " + error);
        }
      } else {
        throw new Error("Яндекс SDK не загружен");
      }
    }
  
    @ensureYsdk
    static async getUserData() {
      try {
        this._player = await this._ysdk.getPlayer();
        return {
          id: this._player.getUniqueID(),
          name: this._player.getName(),
          avatar: this._player.getPhoto('medium'),
          mode: this._player.getMode(),
        };
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        throw error;
      }
    }

    @ensureYsdk
    static async authUser() {
      try {
        if (this._player.getMode() === 'lite') {
          await this._ysdk.auth.openAuthDialog();
          const updatedUserData = await this.getUserData();
          const updatedGameData = await this.getGameData();
          return {
            user: updatedUserData,
            game: updatedGameData
          };
        } else {
          throw new Error("Игрок уже авторизован или SDK не инициализирован");
        }
      } catch (error) {
        console.error("Ошибка авторизации пользователя:", error);
        throw error;
      }
    }

    @ensureYsdk
    static async getGameData(keys?: any) {
      try {
        let gameData = await this._player.getData(keys);
        if (Object.keys(gameData).length) {
          return gameData;
        }
        gameData = {
          completedLevels: [1],
          selectedLevel: 1,
          userLevel: 1,
          userScore: 0,
        }
        await this.setGameData(gameData);
        return gameData;
      } catch (error) {
        console.error("Ошибка получения данных игры:", error);
        throw error;
      }
    }

    @ensureYsdk
    static async setGameData(data?: any) {
      try {
        console.log('Сохранение данных игры:', data)
        return await this._player.setData(data);
      } catch (error) {
        console.error("Ошибка сохранения данных игры:", error);
        throw error;
      }
    }

    @ensureYsdk
    static async showAd() {
      try {
        await this._ysdk.adv.showFullscreenAd();
        console.log("Реклама успешно показана");
      } catch (error) {
        console.error("Ошибка показа рекламы:", error);
      }
    }
  }