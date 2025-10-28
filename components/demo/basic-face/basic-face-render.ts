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

  // --- 1. Рисуем круг (лицо)
  const faceX = width / 2;
  const faceY = height / 2;
  const faceRadius = width / 2 - 20;

  ctx.fillStyle = color || 'white';
  ctx.beginPath();
  ctx.arc(faceX, faceY, faceRadius, 0, Math.PI * 2);
  ctx.fill();

  // --- 2. Глаза (НЕ ТРОГАЕМ)
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

  // --- 3. Рот (НЕ ТРОГАЕМ)
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

  // --- 4. ШЛЯПА (всё остальное не трогаем)
  const svgMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 376.78 152.84">
  <defs>
    <linearGradient id="Градієнт_без_назви_266" x1="-115.5" y1="76.42" x2="450.57" y2="76.42" gradientUnits="userSpaceOnUse">
      <stop offset="0.04" stop-color="#5092ff"/>
      <stop offset="0.53" stop-color="#7ec5ff"/>
      <stop offset="0.94" stop-color="#457fff"/>
    </linearGradient>
  </defs>
  <path d="M.54,114.84c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66C7.93,28.41,8,17.32,15.21,9.51c11-11.84,31.81-8.95,39.33-8,46.52,5.89,93.79-1,140.67,0,49.6,1.11,99.23,11.56,148.66,7.33,5.42-.46,19.73-1.84,27.34,6.67,8.48,9.49,1.69,23.5.66,51.33-1.21,32.81,7.33,37.64,3.34,48.67-8.77,24.18-82.28,38.53-190,36.67C6.34,149.08,1.74,125.38.54,114.84Z"
    style="stroke:#5a90cc;stroke-miterlimit:10;fill:url(#Градієнт_без_назви_266)"/>
  <rect x="176.28" y="53.51" width="29.59" height="54" rx="8.33" style="fill:#dc5513"/>
  <rect x="176.68" y="49.11" width="29.59" height="64.79" rx="8.33"
    transform="translate(109.97 272.98) rotate(-90)" style="fill:#dc5513"/>
</svg>`;

  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  // Настройка смещения шляпы (ручная подгонка)
  const hatOffsetX = -188; // смещение влево/вправо
  const hatOffsetY = -190; // смещение вверх/вниз
  const hatWidth = 376.78;
  const hatHeight = 152.84;

  img.onload = () => {
    ctx.save();
    // Привязка шляпы к кругу
    ctx.translate(faceX + hatOffsetX, faceY - faceRadius + hatOffsetY);
    ctx.drawImage(img, 0, 0, hatWidth, hatHeight);
    ctx.restore();
    URL.revokeObjectURL(url);
  };

  img.src = url;
}
