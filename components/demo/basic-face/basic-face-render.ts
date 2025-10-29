type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
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

// Функция для отрисовки SVG на Canvas через createImageBitmap
async function drawSVGBackground(ctx: CanvasRenderingContext2D) {
  const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.76 430.99">
    <defs>
      <linearGradient id="gradient_1" x1="48.48" y1="99.22" x2="421.58" y2="99.22" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#2581c4"/>
        <stop offset="0.48" stop-color="#e3efda"/>
        <stop offset="1" stop-color="#a3c2e7"/>
      </linearGradient>
    </defs>
    <circle cx="213.38" cy="217.61" r="212.99" fill="#fee9cb" stroke="#cbbba0" stroke-miterlimit="10" stroke-width="0.79"/>
    <path d="M48.52,137.36c-.57-5,5.13-5.63,9.26-17.87,5.79-17.14-2.08-25.62-2-52.28.06-15.66.13-26.67,7.28-34.43C74,21,94.67,23.9,102.13,24.84c46.19,5.85,93.12-1,139.67,0,49.25,1.1,98.52,11.48,147.6,7.28,5.38-.46,19.59-1.83,27.14,6.62,8.42,9.42,1.68,23.33.66,51-1.2,32.58,7.28,37.37,3.32,48.33-8.71,24-81.7,38.25-188.65,36.4C54.28,171.36,49.71,147.83,48.52,137.36Z" fill="url(#gradient_1)" stroke="#2d2e83" stroke-miterlimit="10" stroke-width="0.99"/>
    <rect x="198.44" y="50.52" width="27.94" height="50.99" rx="7.86" fill="#e30613"/>
    <rect x="181.83" y="62.98" width="61.17" height="27.94" rx="7.86" fill="#e30613"/>
  </svg>
  `;

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = await createImageBitmap(await fetch(url).then(r => r.blob()));

  ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  URL.revokeObjectURL(url);
}

export async function renderBasicFace(props: BasicFaceProps) {
  const { ctx, eyeScale: eyesOpenness, mouthScale: mouthOpenness } = props;
  const { width, height } = ctx.canvas;

  ctx.clearRect(0, 0, width, height);

  // --- Рисуем SVG фон ---
  await drawSVGBackground(ctx);

  // --- Глаза ---
  const eyesCenter = [width / 2, height / 2.425];
  const eyesOffset = width / 15;
  const eyeRadius = width / 30;
  const eyesPosition: Array<[number, number]> = [
    [eyesCenter[0] - eyesOffset, eyesCenter[1]],
    [eyesCenter[0] + eyesOffset, eyesCenter[1]],
  ];

  ctx.fillStyle = "black";
  eye(ctx, eyesPosition[0], eyeRadius, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyesOpenness + 0.1);

  // --- Рот ---
  const mouthCenter = [width / 2, (height / 2.875) * 1.55];
  const mouthExtent = [width / 10, (height / 5) * mouthOpenness + 10];

  ctx.save();
  ctx.translate(mouthCenter[0], mouthCenter[1]);
  ctx.scale(1, mouthOpenness + height * 0.002);
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1], 0, 0, Math.PI, false);
  ctx.ellipse(0, 0, mouthExtent[0], mouthExtent[1] * 0.45, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.restore();
}
