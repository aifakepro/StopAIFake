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
  const { ctx, color = '#dc5513' } = props;
  const { width, height } = ctx.canvas;
  
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  
  // Calculate icon dimensions based on canvas size
  const iconSize = width * 0.15; // Icon is 15% of canvas width
  const centerX = width / 2;
  const centerY = height / 2;
  const rectWidth = iconSize * 0.3;
  const rectHeight = iconSize * 0.55;
  const cornerRadius = iconSize * 0.085;
  
  ctx.fillStyle = color;
  
  // Draw vertical rectangle (with rounded corners)
  ctx.beginPath();
  ctx.roundRect(
    centerX - rectWidth / 2,
    centerY - rectHeight / 2,
    rectWidth,
    rectHeight,
    cornerRadius
  );
  ctx.fill();
  
  // Draw horizontal rectangle (with rounded corners)
  ctx.beginPath();
  ctx.roundRect(
    centerX - rectHeight / 2,
    centerY - rectWidth / 2,
    rectHeight,
    rectWidth,
    cornerRadius
  );
  ctx.fill();
}
