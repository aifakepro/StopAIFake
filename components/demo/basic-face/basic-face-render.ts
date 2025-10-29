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
  ctx.fill();
  ctx.restore();
};

// helper: rounded rect (x, y, w, h, r)
function roundRectPath(x: number, y: number, w: number, h: number, r: number) {
  const p = new Path2D();
  const rr = Math.min(r, w / 2, h / 2);
  p.moveTo(x + rr, y);
  p.arcTo(x + w, y, x + w, y + h, rr);
  p.arcTo(x + w, y + h, x, y + h, rr);
  p.arcTo(x, y + h, x, y, rr);
  p.arcTo(x, y, x + w, y, rr);
  p.closePath();
  return p;
}

export function renderBasicFace(props: BasicFaceProps) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
  } = props;
  
  const canvas = ctx.canvas;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  // Сохраняем контекст и применяем DPR масштаб
  ctx.save();
  ctx.scale(dpr, dpr);

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // --- Векторная отрисовка SVG ---
  const viewBoxW = 426.76;
  const viewBoxH = 430.99;

  const scale = Math.min(width / viewBoxW, height / viewBoxH);
  const offsetX = (width - viewBoxW * scale) / 2;
  const offsetY = (height - viewBoxH * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // create gradient
  const grad = ctx.createLinearGradient(48.48, 99.22, 421.58, 99.22);
  grad.addColorStop(0, "#2581c4");
  grad.addColorStop(0.48, "#e3efda");
  grad.addColorStop(1, "#a3c2e7");

  // 1) circle (background / body)
  ctx.fillStyle = "#fee9cb";
  ctx.strokeStyle = "#cbbba0";
  ctx.lineWidth = 0.79;
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.arc(213.38, 217.61, 212.99, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2) path (the decorative shape)
  const pathStr =
    "M48.52,137.36c-.57-5,5.13-5.63,9.26-17.87,5.79-17.14-2.08-25.62-2-52.28.06-15.66.13-26.67,7.28-34.43C74,21,94.67,23.9,102.13,24.84c46.19,5.85,93.12-1,139.67,0,49.25,1.1,98.52,11.48,147.6,7.28,5.38-.46,19.59-1.83,27.14,6.62,8.42,9.42,1.68,23.33.66,51-1.2,32.58,7.28,37.37,3.32,48.33-8.71,24-81.7,38.25-188.65,36.4C54.28,171.36,49.71,147.83,48.52,137.36Z";

  const hatPath = new Path2D(pathStr);
  ctx.save();
  ctx.translate(-22.62, -23.34);
  ctx.fillStyle = grad;
  ctx.fill(hatPath);
  ctx.strokeStyle = "#2d2e83";
  ctx.lineWidth = 0.99;
  ctx.lineJoin = "miter";
  ctx.stroke(hatPath);
  ctx.restore();

  // 3) rects (with rx rounded corners)
  const vrx = 7.86;
  const vPath = roundRectPath(198.44, 50.52, 27.94, 50.99, vrx);
  ctx.fillStyle = "#e30613";
  ctx.fill(vPath);

  const hrx = 7.86;
  const hPath = roundRectPath(181.83, 62.98, 61.17, 27.94, hrx);
  ctx.fill(hPath);

  ctx.restore(); // restore SVG transform

  // --- Eyes and mouth ---
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

  ctx.restore(); // restore DPR scale
}
