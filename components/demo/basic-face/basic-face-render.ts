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

const drawHat = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number
) => {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  
  // Gradient for the hat base
  const gradient = ctx.createLinearGradient(-188.39, 76.42, 377.77, 76.42);
  gradient.addColorStop(0.04, '#5092ff');
  gradient.addColorStop(0.53, '#7ec5ff');
  gradient.addColorStop(0.94, '#457fff');
  
  // Draw the main hat shape
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0.54, 114.84);
  ctx.bezierCurveTo(0.54 - 0.57, 114.84 - 5, 0.54 + 5.17, 114.84 - 5.67, 0.54 + 9.33, 114.84 - 18);
  ctx.bezierCurveTo(0.54 + 9.33 + 5.83, 114.84 - 18 - 17.26, 0.54 + 9.33 - 2.1, 114.84 - 18 - 25.8, 0.54 + 9.33 - 2, 114.84 - 18 - 52.66);
  ctx.bezierCurveTo(0.54 + 9.33 - 2 + 0.06, 114.84 - 18 - 52.66 - 15.77, 0.54 + 9.33 - 2 + 0.1, 114.84 - 18 - 52.66 - 26.86, 0.54 + 9.33 - 2 + 7.33, 114.84 - 18 - 52.66 - 34.67);
  ctx.bezierCurveTo(0.54 + 9.33 - 2 + 7.33 + 11, 114.84 - 18 - 52.66 - 34.67 - 11.84, 0.54 + 9.33 - 2 + 7.33 + 31.81, 114.84 - 18 - 52.66 - 34.67 - 9, 0.54 + 9.33 - 2 + 7.33 + 39.34, 114.84 - 18 - 52.66 - 34.67 - 8);
  ctx.lineTo(0.54 + 9.33 - 2 + 7.33 + 39.34 + 46.51, 114.84 - 18 - 52.66 - 34.67 - 8 + 5.89);
  ctx.lineTo(0.54 + 9.33 - 2 + 7.33 + 39.34 + 46.51 + 93.79, 114.84 - 18 - 52.66 - 34.67 - 8 + 5.89 - 1);
  ctx.lineTo(0.54 + 9.33 - 2 + 7.33 + 39.34 + 46.51 + 93.79 + 140.66, 114.84 - 18 - 52.66 - 34.67 - 8 + 5.89);
  ctx.bezierCurveTo(377.77, 8.16, 377.77 + 5.42, 8.16 - 0.46, 377.77 + 27.33, 8.16 + 6.67);
  ctx.bezierCurveTo(377.77 + 27.33 + 8.49, 8.16 + 6.67 + 9.49, 377.77 + 27.33 + 1.69, 8.16 + 6.67 + 23.5, 377.77 + 27.33 + 0.67, 8.16 + 6.67 + 51.33);
  ctx.lineTo(377.77 + 28, 8.16 + 58 + 32.81);
  ctx.bezierCurveTo(377.77 + 28 + 7.33, 8.16 + 90.81 + 5.83, 377.77 + 28 + 3.33, 8.16 + 90.81 + 10.86, 377.77 + 28 + 3.33, 8.16 + 90.81 + 10.86 + 10);
  ctx.bezierCurveTo(377.77 + 31.33 - 8.77, 8.16 + 101.67 + 24.18, 377.77 + 31.33 - 82.27, 8.16 + 101.67 + 38.53, 377.77 + 31.33 - 190, 8.16 + 101.67 + 36.67);
  ctx.bezierCurveTo(6.34, 149.08, 1.73, 125.38, 0.54, 114.84);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Draw the vertical orange rectangle (part of the hat)
  ctx.fillStyle = '#dc5513';
  const rectX = 83.15 - 188.39;
  const rectY = -3 - 76.42;
  const rectWidth = 29.59;
  const rectHeight = 54;
  const rectRadius = 8.33;
  
  ctx.beginPath();
  ctx.moveTo(rectX + rectRadius, rectY);
  ctx.lineTo(rectX + rectWidth - rectRadius, rectY);
  ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectRadius, rectRadius);
  ctx.lineTo(rectX + rectWidth, rectY + rectHeight - rectRadius);
  ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - rectRadius, rectY + rectHeight, rectRadius);
  ctx.lineTo(rectX + rectRadius, rectY + rectHeight);
  ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - rectRadius, rectRadius);
  ctx.lineTo(rectX, rectY + rectRadius);
  ctx.arcTo(rectX, rectY, rectX + rectRadius, rectY, rectRadius);
  ctx.closePath();
  ctx.fill();
  
  // Draw the horizontal orange rectangle
  const rect2CenterX = 176.68 - 188.39;
  const rect2CenterY = 49.11 - 76.42;
  ctx.translate(rect2CenterX, rect2CenterY);
  ctx.rotate(-Math.PI / 2);
  
  const rect2Width = 29.59;
  const rect2Height = 64.79;
  const rect2Radius = 8.33;
  
  ctx.beginPath();
  ctx.moveTo(-rect2Width/2 + rect2Radius, -rect2Height/2);
  ctx.lineTo(rect2Width/2 - rect2Radius, -rect2Height/2);
  ctx.arcTo(rect2Width/2, -rect2Height/2, rect2Width/2, -rect2Height/2 + rect2Radius, rect2Radius);
  ctx.lineTo(rect2Width/2, rect2Height/2 - rect2Radius);
  ctx.arcTo(rect2Width/2, rect2Height/2, rect2Width/2 - rect2Radius, rect2Height/2, rect2Radius);
  ctx.lineTo(-rect2Width/2 + rect2Radius, rect2Height/2);
  ctx.arcTo(-rect2Width/2, rect2Height/2, -rect2Width/2, rect2Height/2 - rect2Radius, rect2Radius);
  ctx.lineTo(-rect2Width/2, -rect2Height/2 + rect2Radius);
  ctx.arcTo(-rect2Width/2, -rect2Height/2, -rect2Width/2 + rect2Radius, -rect2Height/2, rect2Radius);
  ctx.closePath();
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
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw the hat (centered at top of canvas, adjust Y position as needed)
  const hatScale = width / 800; // Adjust this to resize the hat
  const hatY = height * 0.15; // Adjust this value to move hat up/down (0.15 = 15% from top)
  drawHat(ctx, width / 2, hatY, hatScale);
  
  // Draw the background circle
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
  ctx.fill();
  
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
