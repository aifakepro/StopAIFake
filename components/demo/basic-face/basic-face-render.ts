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

export function renderBasicFace(props: BasicFaceProps) {
  const { ctx, eyeScale: eyesOpenness, mouthScale: mouthOpenness } = props;
  const { width, height } = ctx.canvas;

  ctx.clearRect(0, 0, width, height);

  // --- Векторный фон из твоего SVG ---

  // Градиент Canvas аналогичный <linearGradient>
  const gradient = ctx.createLinearGradient(
    (48.48 / 426.76) * width,
    (99.22 / 430.99) * height,
    (421.58 / 426.76) * width,
    (99.22 / 430.99) * height
  );
  gradient.addColorStop(0, "#2581c4");
  gradient.addColorStop(0.48, "#e3efda");
  gradient.addColorStop(1, "#a3c2e7");

  // Круг из SVG
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, (212.99 / 430.99) * height, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cbbba0";
  ctx.lineWidth = 0.79;
  ctx.stroke();

  // Путь из SVG (<path>), нормализованный под Canvas
  const svgPath = new Path2D(
    `M48.52,137.36c-.57-5,5.13-5.63,9.26-17.87,5.79-17.14-2.08-25.62-2-52.28.06-15.66.13-26.67,7.28-34.43C74,21,94.67,23.9,102.13,24.84c46.19,5.85,93.12-1,139.67,0,49.25,1.1,98.52,11.48,147.6,7.28,5.38-.46,19.59-1.83,27.14,6.62,8.42,9.42,1.68,23.33.66,51-1.2,32.58,7.28,37.37,3.32,48.33-8.71,24-81.7,38.25-188.65,36.4C54.28,171.36,49.71,147.83,48.52,137.36Z`
  );
  ctx.fillStyle = gradient;
  ctx.fill(svgPath);
  ctx.strokeStyle = "#2d2e83";
  ctx.lineWidth = 0.99;
  ctx.stroke(svgPath);

  // --- Прямоугольники из SVG ---
  ctx.fillStyle = "#e30613";
  ctx.fillRect(
    (198.44 / 426.76) * width,
    (50.52 / 430.99) * height,
    (27.94 / 426.76) * width,
    (50.99 / 430.99) * height
  );
  ctx.fillRect(
    (181.83 / 426.76) * width,
    (62.98 / 430.99) * height,
    (61.17 / 426.76) * width,
    (27.94 / 430.99) * height
  );

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
