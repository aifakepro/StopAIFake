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

// --- Функция рисования шляпы через Canvas API ---
function drawHat(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Центрируем шляпу
  ctx.translate(-187, -152);
  
  // --- Градиент для основной формы ---
  const grad = ctx.createLinearGradient(-115.5, 76.42, 450.57, 76.42);
  grad.addColorStop(0.04, '#5092ff');
  grad.addColorStop(0.53, '#7ec5ff');
  grad.addColorStop(0.94, '#457fff');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 1;
  
  // --- Путь шляпы ---
  ctx.beginPath();
  ctx.moveTo(0.54, 114.84);
  ctx.bezierCurveTo(-0.03, 109.84, 5.17, 109.17, 9.33, 96);
  ctx.bezierCurveTo(15.16, 78.74, 7.33, 70.2, 7.33, 43.34);
  ctx.bezierCurveTo(7.93, 28.41, 8, 17.32, 15.21, 9.51);
  ctx.bezierCurveTo(26.21, -2.33, 46.02, 0.56, 53.54, 1.51);
  ctx.bezierCurveTo(100.06, 7.4, 147.33, 1, 194.21, 1);
  ctx.bezierCurveTo(243.81, 2.11, 293.44, 12.67, 342.87, 8.44);
  ctx.bezierCurveTo(348.29, 7.98, 362.6, 6.6, 370.21, 15.11);
  ctx.bezierCurveTo(378.69, 24.6, 371.9, 38.61, 370.87, 66.44);
  ctx.bezierCurveTo(369.66, 99.25, 378.21, 104.08, 374.22, 115.11);
  ctx.bezierCurveTo(365.45, 139.29, 291.94, 153.64, 184.22, 151.78);
  ctx.bezierCurveTo(6.34, 149.08, 1.74, 125.38, 0.54, 114.84);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // --- Первый прямоугольник ---
  ctx.fillStyle = '#dc5513';
  ctx.beginPath();
  ctx.roundRect(176.28, 53.51, 29.59, 54, 8.33);
  ctx.fill();
  
  // --- Второй прямоугольник с трансформацией ---
  ctx.save();
  ctx.translate(109.97, 272.98);
  ctx.rotate(-Math.PI / 2);
  ctx.beginPath();
  ctx.roundRect(176.68, 49.11, 29.59, 64.79, 8.33);
  ctx.fill();
  ctx.restore();
  
  ctx.restore();
}

export function renderBasicFace(props: BasicFaceProps) {
  const { ctx, eyeScale: eyesOpenness, mouthScale: mouthOpenness, color } = props;
  const { width, height } = ctx.canvas;
  
  ctx.clearRect(0, 0, width, height);
  
  const faceX = width / 2;
  const faceY = height / 2;
  const faceRadius = width / 2 - 20;

  // --- 1. Шляпа (рисуем сначала, чтобы она была позади)
  const hatScale = faceRadius / 200;
  drawHat(ctx, faceX, faceY - faceRadius - 10, hatScale);

  // --- 2. Лицо
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(faceX, faceY, faceRadius, 0, Math.PI * 2);
  ctx.fill();

  // --- 3. Глаза
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

  // --- 4. Рот
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
