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

export function renderBasicFace(props: BasicFaceProps) {
  const { ctx, eyeScale, mouthScale, color } = props;
  const { width, height } = ctx.canvas;

  // Очистка канваса
  ctx.clearRect(0, 0, width, height);

  // === ГОЛОВА ===
  const faceX = width / 2;
  const faceY = height / 2;
  const faceRadius = width / 2 - 20;
  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(faceX, faceY, faceRadius, 0, Math.PI * 2);
  ctx.fill();

  // === ШЛЯПА (встроенный SVG) ===
  ctx.save();
  // подгони позицию шляпы относительно круга
  ctx.translate(faceX - 188, faceY - faceRadius - 120);
  ctx.scale(1, 1); // можешь подстроить вручную

  // путь из твоего SVG
  const hatPath = new Path2D(
    "M.54,114.84c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66C7.93,28.41,8,17.32,15.21,9.51c11-11.84,31.81-8.95,39.33-8,46.52,5.89,93.79-1,140.67,0,49.6,1.11,99.23,11.56,148.66,7.33,5.42-.46,19.73-1.84,27.34,6.67,8.48,9.49,1.69,23.5.66,51.33-1.21,32.81,7.33,37.64,3.34,48.67-8.77,24.18-82.28,38.53-190,36.67C6.34,149.08,1.74,125.38.54,114.84Z"
  );
  ctx.fillStyle = "#7ec5ff"; // середина градиента
  ctx.strokeStyle = "#5a90cc";
  ctx.lineWidth = 2;
  ctx.fill(hatPath);
  ctx.stroke(hatPath);

  // прямоугольники из SVG
  ctx.fillStyle = "#dc5513";
  ctx.beginPath();
  ctx.roundRect(176.28, 53.51, 29.59, 54, 8.33);
  ctx.fill();

  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(-Math.PI / 2);
  ctx.roundRect(-109.97, -272.98, 29.59, 64.79, 8.33);
  ctx.restore();

  ctx.fill();
  ctx.restore();

  // === ГЛАЗА ===
  const eyesCenter = [width / 2, height / 2.425];
  const eyesOffset = width / 15;
  const eyeRadius = width / 30;
  ctx.fillStyle = "black";
  eye(ctx, [eyesCenter[0] - eyesOffset, eyesCenter[1]], eyeRadius, eyeScale + 0.1);
  eye(ctx, [eyesCenter[0] + eyesOffset, eyesCenter[1]], eyeRadius, eyeScale + 0.1);

  // === РОТ ===
  const mouthCenter = [width / 2, (height / 2.875) * 1.55];
  const mouthExtent = [width / 10, (height / 5) * mouthScale + 10];
  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  ctx.scale(1, mouthScale + height * 0.002);
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1], 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1] * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();
}
