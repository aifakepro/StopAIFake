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

// Функция для создания текстуры (паттерн точек)
const createTexture = (ctx: CanvasRenderingContext2D, width: number) => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 20;
  patternCanvas.height = 20;
  const pctx = patternCanvas.getContext('2d')!;
  
  // Создаем паттерн с точками
  pctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 3; i++) {
    pctx.beginPath();
    pctx.arc(5 + i * 7, 5, 1.5, 0, Math.PI * 2);
    pctx.arc(8 + i * 5, 15, 1.5, 0, Math.PI * 2);
    pctx.fill();
  }
  
  return ctx.createPattern(patternCanvas, 'repeat');
};

// Функция для рисования шапки
const drawHat = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  faceRadius: number
) => {
  const hatY = centerY - faceRadius * 0.85;
  const hatWidth = faceRadius * 0.8;
  const hatHeight = faceRadius * 0.4;
  const brimHeight = faceRadius * 0.1;
  
  ctx.save();
  
  // Тень шапки
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  
  // Поля шапки
  ctx.fillStyle = '#2c5f8d';
  ctx.beginPath();
  ctx.ellipse(centerX, hatY + brimHeight, hatWidth * 0.7, brimHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Основная часть шапки
  ctx.fillStyle = '#3a7bc8';
  ctx.beginPath();
  ctx.moveTo(centerX - hatWidth * 0.5, hatY + brimHeight);
  ctx.quadraticCurveTo(
    centerX - hatWidth * 0.5,
    hatY - hatHeight * 0.3,
    centerX - hatWidth * 0.3,
    hatY - hatHeight * 0.5
  );
  ctx.lineTo(centerX + hatWidth * 0.3, hatY - hatHeight * 0.5);
  ctx.quadraticCurveTo(
    centerX + hatWidth * 0.5,
    hatY - hatHeight * 0.3,
    centerX + hatWidth * 0.5,
    hatY + brimHeight
  );
  ctx.closePath();
  ctx.fill();
  
  // Полоска на шапке
  ctx.fillStyle = '#5a9bd8';
  ctx.fillRect(
    centerX - hatWidth * 0.5,
    hatY + brimHeight - 15,
    hatWidth,
    12
  );
  
  // Помпон
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#5a9bd8';
  ctx.beginPath();
  ctx.arc(centerX, hatY - hatHeight * 0.5 - 10, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // Детали помпона
  ctx.fillStyle = '#4a8bc8';
  ctx.beginPath();
  ctx.arc(centerX - 5, hatY - hatHeight * 0.5 - 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 5, hatY - hatHeight * 0.5 - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
  } = props;
  const { width, height } = ctx.canvas;
  const faceRadius = width / 2 - 20;
  
  // Очистка канваса
  ctx.clearRect(0, 0, width, height);
  
  // Тень лица
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  
  // Основной круг лица
  ctx.fillStyle = color || '#f5f5f5';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, faceRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Добавление текстуры
  const texture = createTexture(ctx, width);
  if (texture) {
    ctx.fillStyle = texture;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, faceRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Градиентная подсветка для объема
  const gradient = ctx.createRadialGradient(
    width / 2 - faceRadius * 0.3,
    height / 2 - faceRadius * 0.3,
    0,
    width / 2,
    height / 2,
    faceRadius
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, faceRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Рисуем шапку
  drawHat(ctx, width / 2, height / 2, faceRadius);
  
  // Глаза
  const eyesCenter = [width / 2, height / 2.425];
  const eyesOffset = width / 15;
  const eyeRadius = width / 30;
  const eyesPosition: Array<[number, number]> = [
    [eyesCenter[0] - eyesOffset, eyesCenter[1]],
    [eyesCenter[0] + eyesOffset, eyesCenter[1]],
  ];
  
  ctx.fillStyle = 'black';
  eye(ctx, eyesPosition[0], eyeRadius, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyesOpenness + 0.1);
  
  // Блики в глазах
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(eyesPosition[0][0] - 3, eyesPosition[0][1] - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyesPosition[1][0] - 3, eyesPosition[1][1] - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Рот
  const mouthCenter = [width / 2, (height / 2.875) * 1.55];
  const mouthExtent = [width / 10, (height / 5) * mouthOpenness + 10];
  
  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  ctx.scale(1, mouthOpenness + height * 0.002);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1], 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1] * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();
}
