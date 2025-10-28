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
  x: number,
  y: number,
  scale: number
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Градиент как в SVG
  const gradient = ctx.createLinearGradient(-188.39, 76.42, 188.39, 76.42);
  gradient.addColorStop(0.04, '#5092ff');
  gradient.addColorStop(0.53, '#7ec5ff');
  gradient.addColorStop(0.94, '#457fff');
  
  // Основная форма шляпы из SVG path
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  // Координаты из SVG path, смещённые на -93.13, -56.49
  ctx.moveTo(0.54, 114.84);
  ctx.bezierCurveTo(0.54, 114.84, 0.54, 114.84, 0.54, 114.84);
  ctx.bezierCurveTo(-0.03, 109.84, 5.71, 109.17, 9.87, 96.84);
  ctx.bezierCurveTo(15.7, 79.58, 7.77, 71.04, 7.87, 44.18);
  ctx.bezierCurveTo(7.93, 28.41, 7.97, 17.32, 15.2, 9.51);
  ctx.bezierCurveTo(26.2, -2.33, 47.01, 0.51, 54.54, 1.51);
  ctx.bezierCurveTo(101.05, 7.4, 148.33, 0.51, 195.2, 1.51);
  ctx.bezierCurveTo(244.81, 2.62, 294.43, 13.07, 343.87, 8.84);
  ctx.bezierCurveTo(349.29, 8.38, 363.6, 7, 371.2, 15.51);
  ctx.bezierCurveTo(379.69, 25, 372.89, 39.01, 371.87, 66.84);
  ctx.bezierCurveTo(370.66, 99.65, 379.2, 104.48, 375.2, 115.51);
  ctx.bezierCurveTo(366.43, 139.69, 292.93, 154.04, 185.2, 152.18);
  ctx.bezierCurveTo(6.34, 149.08, 1.73, 125.38, 0.54, 114.84);
  ctx.closePath();
  
  ctx.fill();
  ctx.stroke();
  
  // Вертикальная оранжевая полоска
  ctx.fillStyle = '#dc5513';
  roundRect(83.15, -2.98, 29.59, 54, 8.33);
  ctx.fill();
  
  // Горизонтальная оранжевая полоска (повёрнутая)
  ctx.save();
  ctx.translate(176.68, 49.11);
  ctx.rotate(-Math.PI / 2);
  roundRect(-32.395, -14.795, 64.79, 29.59, 8.33);
  ctx.fill();
  ctx.restore();
  
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
  
  const faceRadius = width / 2 - 20;
  
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, faceRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Шляпа по центру, ты сам поднимешь
  const hatScale = faceRadius / 250;
  drawHat(ctx, width / 2 - 188.39 * hatScale, height / 2, hatScale);
  
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
