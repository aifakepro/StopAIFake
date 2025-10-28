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
type IconProps = {
  ctx: CanvasRenderingContext2D;
  scale: number;
  hatYOffset?: number;
  hatSizeScale?: number;
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
export function renderIcon(props: IconProps) {
  const isMobile = window.innerWidth < 768;
  const { 
    ctx, 
    hatYOffset = isMobile ? 120 : 170, 
    hatSizeScale = isMobile ? 1.1 : 0.9 
  } = props;
  const { width, height } = ctx.canvas;
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Calculate face radius (same as in renderBasicFace)
  const faceRadius = width / 2 - 20;
  const faceCenter = [width / 2, height / 2];
  
  // Position hat at top of the face circle
  const hatCenterX = faceCenter[0];
  const hatTopY = faceCenter[1] - faceRadius;
  
  // Scale the hat based on face size
  const hatScale = (faceRadius * 2) / 500 * hatSizeScale;
  
  ctx.save();
  ctx.translate(hatCenterX, hatTopY + hatYOffset * hatScale);
  ctx.scale(hatScale, hatScale);
  ctx.translate(-376.78 / 2, -152.84 / 2);
  
  // Draw the blue hat shape from SVG path
  const gradient = ctx.createLinearGradient(-115.5, 76.42, 450.57, 76.42);
  gradient.addColorStop(0.04, '#5092ff');
  gradient.addColorStop(0.53, '#7ec5ff');
  gradient.addColorStop(0.94, '#457fff');
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  const path = "M.54,114.84c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66C7.93,28.41,8,17.32,15.21,9.51c11-11.84,31.81-8.95,39.33-8,46.52,5.89,93.79-1,140.67,0,49.6,1.11,99.23,11.56,148.66,7.33,5.42-.46,19.73-1.84,27.34,6.67,8.48,9.49,1.69,23.5.66,51.33-1.21,32.81,7.33,37.64,3.34,48.67-8.77,24.18-82.28,38.53-190,36.67C6.34,149.08,1.74,125.38.54,114.84Z";
  const path2D = new Path2D(path);
  ctx.fill(path2D);
  ctx.stroke(path2D);
  
  // Draw the red cross
  ctx.fillStyle = '#dc5513';
  
  // Vertical rectangle
  ctx.beginPath();
  ctx.roundRect(176.28, 53.51, 29.59, 54, 8.33);
  ctx.fill();
  
  // Horizontal rectangle
  ctx.save();
  ctx.translate(191.475, 81.505);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-191.475, -81.505);
  ctx.beginPath();
  ctx.roundRect(176.68, 49.11, 29.59, 64.79, 8.33);
  ctx.fill();
  ctx.restore();
  
  ctx.restore();
}
