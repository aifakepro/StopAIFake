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

// Функция для применения текстуры на круг
const applyTexture = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  textureImage: HTMLImageElement
) => {
  ctx.save();
  
  // Создаем маску круга
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
  
  // Рисуем текстуру внутри круга
  const size = radius * 2;
  ctx.drawImage(
    textureImage,
    centerX - radius,
    centerY - radius,
    size,
    size
  );
  
  ctx.restore();
};

// Функция для рисования PNG шапки
const drawHatImage = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  faceRadius: number,
  hatImage: HTMLImageElement
) => {
  // Размер шапки
  const hatWidth = faceRadius * 1.5;
  const hatHeight = (hatImage.height / hatImage.width) * hatWidth;
  
  // Позиция - меняй 0.9 чтобы поднять/опустить шапку
  const hatX = centerX - hatWidth / 2;
  const hatY = centerY - faceRadius * 1.5;
  
  // Закругление краев
  ctx.save();
  ctx.beginPath();
  const borderRadius = 15; // ← меняй радиус закругления (больше = круглее)
  ctx.moveTo(hatX + borderRadius, hatY);
  ctx.lineTo(hatX + hatWidth - borderRadius, hatY);
  ctx.quadraticCurveTo(hatX + hatWidth, hatY, hatX + hatWidth, hatY + borderRadius);
  ctx.lineTo(hatX + hatWidth, hatY + hatHeight - borderRadius);
  ctx.quadraticCurveTo(hatX + hatWidth, hatY + hatHeight, hatX + hatWidth - borderRadius, hatY + hatHeight);
  ctx.lineTo(hatX + borderRadius, hatY + hatHeight);
  ctx.quadraticCurveTo(hatX, hatY + hatHeight, hatX, hatY + hatHeight - borderRadius);
  ctx.lineTo(hatX, hatY + borderRadius);
  ctx.quadraticCurveTo(hatX, hatY, hatX + borderRadius, hatY);
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(hatImage, hatX, hatY, hatWidth, hatHeight);
  ctx.restore();
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
  
  // Лицо рисуем на основе ширины, чтобы был круг
  const faceRadius = width / 2 - 20;
  const faceY = faceRadius + 40; // Лицо в верхней части, оставляем место снизу
  
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
  ctx.arc(width / 2, faceY, faceRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Применение пользовательской текстуры
  if (textureImage && textureImage.complete) {
    applyTexture(ctx, width / 2, faceY, faceRadius, textureImage);
  }
  
  // Градиентная подсветка для объема
  const gradient = ctx.createRadialGradient(
    width / 2 - faceRadius * 0.3,
    faceY - faceRadius * 0.3,
    0,
    width / 2,
    faceY,
    faceRadius
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, faceY, faceRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Глаза
  const eyesCenter = [width / 2, faceY / 1.0165];
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
  const mouthCenter = [width / 2, faceY * 1.0777];
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
  
  // Рисуем PNG шапку поверх всего
  if (hatImage && hatImage.complete) {
    drawHatImage(ctx, width / 2, faceY, faceRadius, hatImage);
  }
}
