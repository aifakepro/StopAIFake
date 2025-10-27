/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
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

// Кэш для загруженных изображений
const imageCache: { [key: string]: HTMLImageElement | null } = {};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache[url]) {
      resolve(imageCache[url]!);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[url] = img;
      resolve(img);
    };
    img.onerror = () => {
      imageCache[url] = null;
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

// URLs для изображений (замените на свои ссылки)
const TEXTURE_URL = 'YOUR_TEXTURE_IMAGE_URL_HERE'; // URL текстуры для круга
const HAT_URL = 'YOUR_HAT_IMAGE_URL_HERE'; // URL изображения шапки

// Предзагрузка изображений
loadImage(TEXTURE_URL).catch(() => console.warn('Texture failed to load'));
loadImage(HAT_URL).catch(() => console.warn('Hat failed to load'));

export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
  } = props;
  const { width, height } = ctx.canvas;
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const faceRadius = width / 2 - 20;
  
  // Draw the background circle with texture if available
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
  ctx.clip();
  
  const textureImg = imageCache[TEXTURE_URL];
  if (textureImg) {
    // Рисуем текстуру
    const pattern = ctx.createPattern(textureImg, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = color || 'white';
    }
  } else {
    ctx.fillStyle = color || 'white';
  }
  
  ctx.fillRect(centerX - faceRadius, centerY - faceRadius, faceRadius * 2, faceRadius * 2);
  ctx.restore(); // Важно! Восстанавливаем контекст, убираем clip
  
  // Draw circle outline
  ctx.strokeStyle = color || 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  const eyesCenter = [centerX, height / 2.425];
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
  
  const mouthCenter = [centerX, (height / 2.875) * 1.55];
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
  
  // Draw the hat on top (ПОСЛЕ восстановления clip)
  const hatImg = imageCache[HAT_URL];
  if (hatImg) {
    const hatWidth = width * 0.8; // Шапка 80% ширины лица
    const hatHeight = (hatImg.height / hatImg.width) * hatWidth;
    const hatX = centerX - hatWidth / 2;
    const hatY = centerY - faceRadius - hatHeight * 0.7; // Позиция над кругом
    
    ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
  }
}
