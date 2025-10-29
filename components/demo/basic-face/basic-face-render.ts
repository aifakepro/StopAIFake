export function renderBasicFace(props: BasicFaceProps) {
  const { ctx, eyeScale: eyesOpenness, mouthScale: mouthOpenness } = props;
  const { width, height } = ctx.canvas;

  ctx.clearRect(0, 0, width, height);

  // --- Рисуем фон как векторный SVG ---
  // Градиент
  const gradient = ctx.createLinearGradient(
    (48.48 / 426.76) * width,
    (99.22 / 430.99) * height,
    (421.58 / 426.76) * width,
    (99.22 / 430.99) * height
  );
  gradient.addColorStop(0, "#2581c4");
  gradient.addColorStop(0.48, "#e3efda");
  gradient.addColorStop(1, "#a3c2e7");

  // Круг
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cbbba0";
  ctx.lineWidth = 0.79;
  ctx.stroke();

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
