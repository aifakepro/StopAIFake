/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
  textureImage?: HTMLImageElement | null;
  hatImage?: HTMLImageElement | null;
};

// Кэш для загруженных изображений
const imageCache: { [key: string]: HTMLImageElement } = {};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  if (imageCache[url]) {
    return Promise.resolve(imageCache[url]);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[url] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
};

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
  ctx.restore();
  ctx.fill();
};

export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
    textureImage,
    hatImage,
  } = props;
  const { width, height } = ctx.canvas;

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  const faceRadius = width / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;

  // Draw the background circle with texture
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
  ctx.clip();

  // Fill with color first
  ctx.fillStyle = color || 'white';
  ctx.fill();

  // === ТЕКСТУРА (BOTmed1.jpg) — ЧЁТКАЯ НА МОБИЛЬНОМ ===
  const textureImg = imageCache['https://i.ibb.co/7dNm0Ksz/BOTmed1.jpg'];
  if (textureImg && textureImg.complete) {
    const texSize = faceRadius * 2;
    const dpr = window.devicePixelRatio || 1;
    const renderSize = texSize * dpr;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = renderSize;
    tempCanvas.height = renderSize;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(textureImg, 0, 0, renderSize, renderSize);

    ctx.drawImage(tempCanvas, centerX - texSize / 2, centerY - texSize / 2, texSize, texSize);
  }

  ctx.restore();

  const eyesCenter = [width / 2, height / 2.425];
  const eyesOffset = width / 15;
  const eyeRadius = width / 30;
  const eyesPosition: Array<[number, number]> = [
    [eyesCenter[0] - eyesOffset, eyesCenter[1]],
    [eyesCenter[0] + eyesOffset, eyesCenter[1]],
  ];

  // Draw the eyes
  ctx.fillStyle = 'black';
  eye(ctx, eyesPosition[0], eyeRadius, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyesOpenness + 0.1);

  const mouthCenter = [width / 2, (height / 2.875) * 1.55];
  const mouthExtent = [width / 10, (height / 5) * mouthOpenness + 10];

  // Draw the mouth
  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  ctx.scale(1, mouthOpenness + height * 0.002);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1], 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1] * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();

  // === ШЛЯПА (kapBot1.png) — ЧЁТКАЯ НА МОБИЛЬНОМ ===
  const hatImg = imageCache['https://i.ibb.co/mVxKD0T8/kapBot1.png'];
  if (hatImg && hatImg.complete) {
    const isMobile = width < 780;

    let hatWidth, hatHeight, hatX, hatY;

    if (isMobile) {
      hatWidth = width * 0.7;
      hatHeight = (hatImg.height / hatImg.width) * hatWidth;
      hatX = centerX - hatWidth / 2;
      hatY = centerY - faceRadius - hatHeight * 0.15;
    } else {
      hatWidth = width * 1.4;
      hatHeight = (hatImg.height / hatImg.width) * hatWidth;
      hatX = centerX - hatWidth / 2;
      hatY = centerY - faceRadius - hatHeight * 0.3;
    }

    const dpr = window.devicePixelRatio || 1;
    const renderWidth = hatWidth * dpr;
    const renderHeight = hatHeight * dpr;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = renderWidth;
    tempCanvas.height = renderHeight;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(hatImg, 0, 0, renderWidth, renderHeight);

    ctx.drawImage(tempCanvas, hatX, hatY, hatWidth, hatHeight);
  }
}

// Предзагрузка изображений
loadImage('https://i.ibb.co/7dNm0Ksz/BOTmed1.jpg').catch(console.error);
loadImage('https://i.ibb.co/mVxKD0T8/kapBot1.png').catch(console.error);
