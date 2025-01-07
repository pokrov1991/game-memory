import SDK from './sdk';
import { ensureYsdk } from './decorators/ensureYsdk';
import { IYandexSDK, IPlayer } from '../types/yandexSdk';

declare global {
  interface Window {
    YaGames: {
      init: () => Promise<IYandexSDK>;
    };
  }
}

export default class YandexSDK extends SDK {
    static _ysdk: IYandexSDK | null = null;
  
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
        const player: IPlayer = await this._ysdk.getPlayer();
        return {
          id: player.getUniqueID(),
          name: player.getName(),
          avatar: player.getPhoto('medium'),
          mode: player.getMode(),
        };
      } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        throw error;
      }
    }

    @ensureYsdk
    static async authUser() {
      try {
        const player: IPlayer = await this._ysdk.getPlayer();
        if (player.getMode() === 'lite') {
          this._ysdk.auth.openAuthDialog().then(() => {
            return this.getUserData()
          }).catch((error) => {
            throw error; 
          });
        }
      } catch (error) {
        console.error("Ошибка авторизации пользователя:", error);
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