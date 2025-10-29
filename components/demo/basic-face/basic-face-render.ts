/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
type RenderFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
  hatYOffset?: number;
};

const eye = (ctx: CanvasRenderingContext2D, pos: [number, number], radius: number, scaleY: number) => {
  ctx.save();
  ctx.translate(pos[0], pos[1]);
  ctx.scale(1, scaleY);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export function renderBasicFace({ ctx, eyeScale, mouthScale, color, hatYOffset = -100 }: RenderFaceProps) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  
  // --- Шляпа (SVG Path) ---
  const hatPath = new Path2D(
    "M48.52,137.36c-.57-5,5.13-5.63,9.26-17.87,5.79-17.14-2.08-25.62-2-52.28.06-15.66.13-26.67,7.28-34.43C74,21,94.67,23.9,102.13,24.84c46.19,5.85,93.12-1,139.67,0,49.25,1.10,98.52,11.48,147.60,7.28,5.38-.46,19.59-1.83,27.14,6.62,8.42,9.42,1.68,23.33.66,51-1.20,32.58,7.28,37.37,3.32,48.33-8.71,24-81.70,38.25-188.65,36.40C54.28,171.36,49.71,147.83,48.52,137.36Z"
  );
  
  ctx.save();
  const faceRadius = width / 2 - 20;
  const faceScale = (faceRadius * 2) / 500 * 1.3;
  ctx.translate(width / 2, height / 2 + hatYOffset);
  ctx.scale(faceScale, faceScale);
  ctx.translate(-213.38, -217.61); // Центр з viewBox SVG
  
  // Градієнт для шляпи
  const gradient = ctx.createLinearGradient(48.48, 99.22, 421.58, 99.22);
  gradient.addColorStop(0, '#2581c4');
  gradient.addColorStop(0.48, '#e3efda');
  gradient.addColorStop(1, '#a3c2e7');
  
  ctx.fillStyle = gradient;
  ctx.fill(hatPath);
  ctx.strokeStyle = '#2d2e83';
  ctx.lineWidth = 0.99;
  ctx.stroke(hatPath);
  
  // Червоний хрест (вертикальна частина)
  ctx.fillStyle = '#e30613';
  ctx.beginPath();
  ctx.roundRect(198.44, 50.52, 27.94, 50.99, 7.86);
  ctx.fill();
  
  // Червоний хрест (горизонтальна частина)
  ctx.beginPath();
  ctx.roundRect(181.83, 62.98, 61.17, 27.94, 7.86);
  ctx.fill();
  
  ctx.restore();
  
  // --- Глаза ---
  const eyesCenter = [width / 2, height / 2.425];
  const eyesOffset = width / 15;
  const eyeRadius = width / 30;
  const eyesPosition: Array<[number, number]> = [
    [eyesCenter[0] - eyesOffset, eyesCenter[1]],
    [eyesCenter[0] + eyesOffset, eyesCenter[1]],
  ];
  ctx.fillStyle = 'black';
  eye(ctx, eyesPosition[0], eyeRadius, eyeScale + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyeScale + 0.1);
  
  // --- Рот ---
  const mouthCenter = [width / 2, (height / 2.875) * 1.55];
  const mouthExtent = [width / 10, (height / 5) * mouthScale + 10];
  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  ctx.scale(1, mouthScale + height * 0.002);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1], 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1] * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();
}
