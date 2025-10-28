/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
  hatY?: number; // Ви зможете підняти/опустити шляпу цим параметром
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

const drawHat = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number
) => {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  
  // Градієнт з вашого SVG
  const gradient = ctx.createLinearGradient(-22.37, 132.91, 543.7, 132.91);
  gradient.addColorStop(0.04, '#5092ff');
  gradient.addColorStop(0.53, '#7ec5ff');
  gradient.addColorStop(0.94, '#457fff');
  
  // Основна форма шляпи (path з вашого SVG)
  const hatPath = new Path2D('M93.67,171.33c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66.06-15.77.1-26.86,7.33-34.67,11-11.84,31.81-9,39.34-8,46.51,5.89,93.79-1,140.66,0,49.61,1.11,99.23,11.56,148.67,7.33,5.42-.46,19.73-1.84,27.33,6.67,8.49,9.49,1.69,23.5.67,51.33-1.21,32.81,7.33,37.64,3.33,48.67-8.77,24.18-82.27,38.53-190,36.67C99.47,205.57,94.86,181.87,93.67,171.33Z');
  
  ctx.translate(-93.13, -56.49);
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 1;
  ctx.fill(hatPath);
  ctx.stroke(hatPath);
  
  // Перший прямокутник (вертикальний)
  ctx.fillStyle = '#dc5513';
  ctx.beginPath();
  ctx.roundRect(176.28, 53.51, 29.59, 54, 8.33);
  ctx.fill();
  
  // Другий прямокутник (горизонтальний, повернутий)
  ctx.save();
  ctx.translate(269.81 + 29.59/2, 105.6 + 64.79/2);
  ctx.rotate(-Math.PI/2);
  ctx.beginPath();
  ctx.roundRect(-29.59/2, -64.79/2, 29.59, 64.79, 8.33);
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
    hatY = -150, // Дефолтна позиція, ви можете змінити
  } = props;
  const { width, height } = ctx.canvas;
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw the background circle
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Малюємо шляпу по центру
  const hatScale = width / 800;
  drawHat(ctx, width / 2, height / 2 + hatY, hatScale);
  
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
}
