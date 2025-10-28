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

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawHat = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  faceRadius: number
) => {
  ctx.save();
  
  // Масштаб шляпы относительно лица
  const hatScale = faceRadius / 250;
  
  // Позиция шляпы - над головой
  const hatY = centerY - faceRadius * 1.15;
  
  // Основа шляпы (широкие поля)
  const brimWidth = faceRadius * 1.5;
  const brimHeight = faceRadius * 0.3;
  
  // Градиент для полей
  const gradient = ctx.createLinearGradient(
    centerX - brimWidth / 2,
    hatY,
    centerX + brimWidth / 2,
    hatY
  );
  gradient.addColorStop(0, '#5092ff');
  gradient.addColorStop(0.5, '#7ec5ff');
  gradient.addColorStop(1, '#457fff');
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 2 * hatScale;
  
  // Рисуем поля шляпы (эллипс)
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    hatY + brimHeight / 2,
    brimWidth / 2,
    brimHeight / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
  
  // Верхняя часть шляпы (тулья)
  const crownWidth = faceRadius * 0.8;
  const crownHeight = faceRadius * 0.6;
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    hatY - crownHeight / 2,
    crownWidth / 2,
    crownHeight / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
  
  // Оранжевая вертикальная полоска
  ctx.fillStyle = '#dc5513';
  const bandWidth = 15 * hatScale;
  const bandHeight = 27 * hatScale;
  roundRect(
    ctx,
    centerX - crownWidth * 0.35 - bandWidth / 2,
    hatY - crownHeight * 0.7,
    bandWidth,
    bandHeight,
    4 * hatScale
  );
  ctx.fill();
  
  // Оранжевая горизонтальная полоска
  const hBandWidth = 32 * hatScale;
  const hBandHeight = 15 * hatScale;
  roundRect(
    ctx,
    centerX + crownWidth * 0.15,
    hatY - crownHeight * 0.4 - hBandHeight / 2,
    hBandWidth,
    hBandHeight,
    4 * hatScale
  );
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
  
  ctx.clearRect(0, 0, width, height);
  
  // Радиус лица
  const faceRadius = width / 2 - 20;
  
  // Рисуем лицо
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, faceRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Рисуем шляпу НАД лицом
  drawHat(ctx, width / 2, height / 2, faceRadius);
  
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
