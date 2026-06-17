import { ILeaderboardDescription, ILeaderboardEntries } from '@/types';
export default class SDK {
    static _initialized = false; // Флаг, указывающий на успешную инициализацию
  
    static async init() {
      throw new Error("Метод init() должен быть реализован");
    }
  
    static ensureInitialized() {
      if (!this._initialized) {
        throw new Error("SDK не инициализирован. Вызовите init() перед использованием других методов.");
      }
    }
  
    static async getUserData(): Promise<{ id: string; name: string; avatar: string; }> {
        this.ensureInitialized();
        throw new Error("Метод getUserData() должен быть реализован");
    }

    static async authUser(): Promise<{ 
      user: { id: string; name: string; avatar: string; mode: string; },
      game: { completedLevels: number[]; selectedLevel: number; userLevel: number; userScore: number; }
    }> {
      this.ensureInitialized();
      throw new Error("Метод authUser() должен быть реализован");
    }

    static async getGameData(): Promise<{ completedLevels: number[]; selectedLevel: number; userLevel: number; userScore: number; }> {
      this.ensureInitialized();
      throw new Error("Метод getGameData() должен быть реализован");
    }

    static async setGameData() {
      this.ensureInitialized();
      throw new Error("Метод setGameData() должен быть реализован");
    }

    static async showAd() {
      this.ensureInitialized();
      throw new Error("Метод showAd() должен быть реализован");
    }

    static async getLeaderboard(leaderboardName: string): Promise<ILeaderboardDescription>  {
      this.ensureInitialized();
      throw new Error("Метод getLeaderboard() должен быть реализован");
    }

    static async setLeaderboardScore(leaderboardName: string, score: number, extraData?: string): Promise<void>  {
      this.ensureInitialized();
      throw new Error("Метод setLeaderboardScore() должен быть реализован");
    }

    static async getLeaderboardEntries(leaderboardName: string, options: {includeUser?: boolean; quantityAround?: number; quantityTop?: number;}): Promise<ILeaderboardEntries>  {
      this.ensureInitialized();
      throw new Error("Метод getLeaderboardEntries() должен быть реализован");
    }
  }
  