type ImageAsset = { type: "image"; src: string; element: HTMLImageElement };
type AudioAsset = { type: "audio"; src: string; element: HTMLAudioElement };
type FileAsset = { type: "file"; src: string; blob: Blob };
type Asset = ImageAsset | AudioAsset | FileAsset;

function loadImage(src: string): Promise<ImageAsset> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ type: "image", src, element: img });
    img.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));
    img.src = src;
  });
}

function loadAudio(src: string): Promise<AudioAsset> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    const onReady = () => {
      cleanup();
      resolve({ type: "audio", src, element: audio });
    };

    const onError = () => {
      cleanup();
      reject(new Error(`Не удалось загрузить аудио: ${src}`));
    };

    const cleanup = () => {
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error", onError);
    };

    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });

    audio.preload = "auto";
    audio.src = src;
    audio.load();
  });
}

function loadFile(src: string): Promise<Asset> {
  const fixedSrc = src.startsWith("/")
    ? `.${src}`
    : src;

  const lower = fixedSrc.toLowerCase();

  if (/\.(png|jpg|jpeg|webp|gif|svg)$/.test(lower)) {
    return loadImage(fixedSrc);
  }

  if (/\.(mp3|wav|ogg|m4a)$/.test(lower)) {
    return loadAudio(fixedSrc);
  }

  return fetch(fixedSrc).then((response) => {
    if (!response.ok) {
      throw new Error(`Не удалось загрузить файл: ${fixedSrc}`);
    }

    return response.blob().then((blob) => ({
      type: "file",
      src: fixedSrc,
      blob,
    }));
  });
}

export async function preloadAssets(onProgress?: (percent: number) => void): Promise<Map<string, Asset>> {
  const response = await fetch("./assets-manifest.json");

  if (!response.ok) {
    throw new Error("Не удалось загрузить assets-manifest.json");
  }

  const data = await response.json();
  const assets = data.assets || [];

  if (!assets.length) {
    onProgress?.(100);
    return new Map();
  }

  let loaded = 0;
  const loadedAssets = new Map<string, Asset>();

  const tasks = assets.map(async (src: string) => {
    const asset = await loadFile(src);
    loadedAssets.set(src, asset);

    loaded += 1;
    const percent = Math.round((loaded / assets.length) * 100);
    onProgress?.(percent);
  });

  await Promise.all(tasks);

  return loadedAssets;
}
