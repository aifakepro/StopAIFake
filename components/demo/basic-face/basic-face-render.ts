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

// Helper function to draw a rounded rectangle
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

// Draw the hat based on SVG
const drawHat = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number
) => {
  ctx.save();
  
  // Scale and position the hat
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  
  // Draw the main blue hat shape (elliptical/curved top)
  const gradient = ctx.createLinearGradient(-188.39, 0, 188.39, 0);
  gradient.addColorStop(0.04, '#5092ff');
  gradient.addColorStop(0.53, '#7ec5ff');
  gradient.addColorStop(0.94, '#457fff');
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#5a90cc';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  // Approximate the curved hat shape
  ctx.ellipse(0, 0, 180, 70, 0, Math.PI, 2 * Math.PI, false);
  ctx.ellipse(0, -60, 160, 30, 0, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Draw the vertical orange band (left side of SVG)
  ctx.fillStyle = '#dc5513';
  roundRect(ctx, -105, -80, 29.59, 54, 8.33);
  ctx.fill();
  
  // Draw the horizontal orange band (right side, rotated)
  ctx.save();
  ctx.translate(95, -40);
  ctx.rotate(-Math.PI / 2);
  roundRect(ctx, -32.395, -14.795, 64.79, 29.59, 8.33);
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
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw the background circle
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw the hat on top of the face
  drawHat(ctx, width / 2, height / 2 - width / 2.5, width / 800);
  
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
