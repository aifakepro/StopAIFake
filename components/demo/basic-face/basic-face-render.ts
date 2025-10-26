/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string; // fallback цвет лица
  faceTexture?: CanvasPattern; // заранее загруженная текстура лица
  hatImg?: HTMLImageElement; // заранее загруженное изображение шапки
};

// Вспомогательная функция для рисования глаза
const eye = (
  ctx: CanvasRenderingContext2D,
  pos: [number, number],
  radius: number,
  scaleY: number
) => {
  ctx.save();
  ctx.translate(pos[0], pos[1]);
  ctx.scale(1, scaleY);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export function renderBasicFace(props: BasicFaceProps) {
  const { ctx, eyeScale: eyesOpenness, mouthScale: mouthOpenness, color, faceTexture, hatImg } = props;
  const { width, height } = ctx.canvas;

  // --- очистка канваса ---
  ctx.clearRect(0, 0, width, height);

  // --- рисуем лицо (круг) ---
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);

  // если есть текстура — используем её
  if (faceTexture) {
    ctx.fillStyle = faceTexture;
  } else {
    ctx.fillStyle = color || 'white';
  }
  ctx.fill();

  // --- рисуем глаза ---
  const eyesCenter: [number, number] = [width / 2, height / 2.425];
  const eyesOffset = width / 15;
  const eyeRadius = width / 30;
  const eyesPosition: [number, number][] = [
    [eyesCenter[0] - eyesOffset, eyesCenter[1]],
    [eyesCenter[0] + eyesOffset, eyesCenter[1]],
  ];

  ctx.fillStyle = 'black';
  eye(ctx, eyesPosition[0], eyeRadius, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyesOpenness + 0.1);

  // --- рисуем рот ---
  const mouthCenter: [number, number] = [width / 2, (height / 2.875) * 1.55];
  const mouthExtent: [number, number] = [width / 10, (height / 5) * mouthOpenness + 10];

  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  ctx.scale(1, mouthOpenness + height * 0.002);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1], 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1] * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();

  // --- рисуем шапку, если есть ---
  if (hatImg) {
    const hatWidth = width * 0.8;
    const hatHeight = hatWidth * 0.45;
    const hatX = width / 2 - hatWidth / 2;
    const hatY = height / 2 - width / 1.45;
    ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
  }
}

/**
 * Вспомогательная функция для предзагрузки текстуры лица
 */
export function preloadFaceTexture(url: string, ctx: CanvasRenderingContext2D): Promise<CanvasPattern> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const pattern = ctx.createPattern(img, 'no-repeat')!;
      resolve(pattern);
    };
  });
}

/**
 * Вспомогательная функция для предзагрузки шапки / колпака
 */
export function preloadHat(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
  });
}
