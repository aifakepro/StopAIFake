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
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
  } = props;
  const { width, height } = ctx.canvas;

  // Очистка канваса
  ctx.clearRect(0, 0, width, height);

  // Фон круга
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

  // Глаза
  ctx.fillStyle = 'black';
  eye(ctx, eyesPosition[0], eyeRadius, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyesOpenness + 0.1);

  // Рот
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

  // === SVG-шляпа (по центру) ===
  ctx.save();

  // Центруем SVG по верху головы
  const svgWidth = width * 0.6;
  const svgHeight = svgWidth * (152.84 / 376.78);
  const x = (width - svgWidth) / 2;
  const y = height * 0.05; // над глазами

  ctx.translate(x, y);
  ctx.scale(svgWidth / 376.78, svgHeight / 152.84);

  // SVG path как Path2D
  const hatPath = new Path2D(
    "M.54,114.84c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66C7.93,28.41,8,17.32,15.21,9.51c11-11.84,31.81-8.95,39.33-8,46.52,5.89,93.79-1,140.67,0,49.6,1.11,99.23,11.56,148.66,7.33,5.42-.46,19.73-1.84,27.34,6.67,8.48,9.49,1.69,23.5.66,51.33-1.21,32.81,7.33,37.64,3.34,48.67-8.77,24.18-82.28,38.53-190,36.67C6.34,149.08,1.74,125.38.54,114.84Z"
  );

  // Градиент
  const grad = ctx.createLinearGradient(-115.5, 76.42, 450.57, 76.42);
  grad.addColorStop(0.04, "#5092ff");
  grad.addColorStop(0.53, "#7ec5ff");
  grad.addColorStop(0.94, "#457fff");

  ctx.fillStyle = grad;
  ctx.strokeStyle = "#5a90cc";
  ctx.lineWidth = 1;
  ctx.fill(hatPath);
  ctx.stroke(hatPath);

  // Красные прямоугольники (крест)
  ctx.fillStyle = "#dc5513";
  ctx.beginPath();
  ctx.roundRect(176.28, 53.51, 29.59, 54, 8.33);
  ctx.fill();

  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(-Math.PI / 2);
  ctx.roundRect(-223.87, 176.68, 64.79, 29.59, 8.33);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
