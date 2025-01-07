export interface IYandexSDK {
    adv: {
      showFullscreenAd: () => Promise<void>;
    };
    auth: {
      openAuthDialog: () => Promise<void>;
    },
    getPlayer: () => Promise<IPlayer>;
  }
  
  export interface IPlayer {
    getUniqueID: () => string;
    getName: () => string;
    getPhoto: (size: string) => string;
    getMode: () => string;
  }
  