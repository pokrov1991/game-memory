export function ensureYsdk(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (!target._initialized) {
      throw new Error("Yandex SDK не инициализирован. Вызовите init() перед использованием.");
    }

    if (!target._ysdk) {
      throw new Error("Объект Yandex SDK отсутствует. Возможно, произошла ошибка при инициализации.");
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}
