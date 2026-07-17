export interface IYandexSDK {
  payments: {
    purchase: (data: { id: string; developerPayload?: string }) => Promise<IPurchase>;
    getPurchases: () => Promise<IPurchase[]>;
  },
  leaderboards: {
    getDescription: (leaderboardName: string) => Promise<ILeaderboardDescription>;
    setScore: (leaderboardName: string, score: number, extraData?: string) => Promise<void>;
    getEntries: (
      leaderboardName: string,
      options: {
          includeUser?: boolean;
          quantityAround?: number;
          quantityTop?: number;
      }) => Promise<ILeaderboardEntries>;
  },
  adv: {
    showFullscreenAd: () => Promise<void>;
  };
  auth: {
    openAuthDialog: () => Promise<void>;
  },
  getPlayer: () => Promise<IPlayer>;
}

export interface IPurchase {
  productID: string;
  purchaseToken: string;
  developerPayload: string;
}

export interface IPlayer {
  getUniqueID: () => string;
  getName: () => string;
  getPhoto: (size: string) => string;
  getMode: () => string;
  getData: (keys?: any) => any;
  setData: (data?: any) => any;
  isAuthorized: () => boolean;
}

export interface ILeaderboardDescription {
  appID: string;
  default: boolean;
  description: {
    invert_sort_order: boolean;
    score_format: {
      options: {
        decimal_offset: number;
      };
      type: 'numeric' | 'time';
    };
    sort_order: string;
};
  name: string;
  title: Record<Locale, string>;
}

export interface ILeaderboardEntries {
  leaderboard: ILeaderboardDescription;
  ranges: {
    start: number;
    size: number;
  }[];
  userRank: number;
  entries: ILeaderboardEntry[];
}

export interface ILeaderboardEntry {
  extraData: string;
  rank: number;
  score: number;
  player: {
    publicName: string;
    uniqueID: string;
    getAvatarSrc: (size?: 'small' | 'medium' | 'large') => string;
    getAvatarSrcSet: (size?: 'small' | 'medium' | 'large') => string;
  }
}
