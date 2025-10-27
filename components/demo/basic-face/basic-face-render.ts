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
const TEXTURE_URL = 'YOUR_TEXTURE_IMAGE_URL_HERE';
const HAT_URL = 'https://i.ibb.co/Q34VxmGm/waves.jpg';

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
  
  // Draw the background circle with texture
  const textureImg = imageCache[TEXTURE_URL];
  if (textureImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
    ctx.clip();
    const pattern = ctx.createPattern(textureImg, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = color || 'white';
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  } else {
    ctx.fillStyle = color || 'white';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
    ctx.fill();
  }
  
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
  
  // Draw the hat
  const hatImg = imageCache[HAT_URL];
  if (hatImg) {
    const hatWidth = width * 0.6;
    const hatHeight = (hatImg.height / hatImg.width) * hatWidth;
    const hatX = width / 2 - hatWidth / 2;
    const hatY = 0;
    ctx.drawImage(hatImg, hatX, hatY, hatWidth, hatHeight);
  }
}
