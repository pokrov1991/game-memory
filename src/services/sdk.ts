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
  
    static async getUserData(): Promise<{ id: any; name: any; avatar: any; }> {
        this.ensureInitialized();
        throw new Error("Метод getUserData() должен быть реализован");
    }

    static async authUser() {
      this.ensureInitialized();
      throw new Error("Метод authUser() должен быть реализован");
    }

    static async showAd() {
      this.ensureInitialized();
      throw new Error("Метод showAd() должен быть реализован");
    }
  }
  