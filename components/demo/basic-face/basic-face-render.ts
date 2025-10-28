/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
type BasicFaceProps = {
  ctx: CanvasRenderingContext2D;
  mouthScale: number;
  eyeScale: number;
  color?: string;
  textureImage?: HTMLImageElement | null;
  hatImage?: HTMLImageElement | null;
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
    textureImage,
    hatImage,
  } = props;
  
  // Получаем DPR для правильного расчета размеров
  const dpr = window.devicePixelRatio || 1;
  
  // ВАЖНО: используем логический размер (до масштабирования DPR)
  const width = ctx.canvas.width / dpr;
  const height = ctx.canvas.height / dpr;
  
  // Clear the canvas (используем физический размер)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  const faceRadius = width / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw the background circle with texture
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
  ctx.clip();
  
  // Fill with color first
  ctx.fillStyle = color || 'white';
  ctx.fill();
  
  // Try to draw texture с улучшенной четкостью
  if (textureImage && textureImage.complete) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = 1.0;
    ctx.drawImage(
      textureImage, 
      centerX - faceRadius, 
      centerY - faceRadius, 
      faceRadius * 2, 
      faceRadius * 2
    );
    ctx.globalAlpha = 1.0;
  }
  
  ctx.restore();
  
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
  
  // Draw the hat with adaptive sizing и улучшенной четкостью
  if (hatImage && hatImage.complete) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const isMobile = width < 780;
    
    if (isMobile) {
      // МОБИЛЬНЫЙ - меняй здесь
      const hatWidth = width * 0.7;  // <-- ТУТ РАЗМЕР
      const hatHeight = (hatImage.height / hatImage.width) * hatWidth;
      const hatX = centerX - hatWidth / 2;
      const hatY = centerY - faceRadius - hatHeight * 0.15;  // <-- ТУТ ОТСТУП
      ctx.drawImage(hatImage, hatX, hatY, hatWidth, hatHeight);
    } else {
      // ПК - меняй здесь
      const hatWidth = width * 1.4;  // <-- ТУТ РАЗМЕР
      const hatHeight = (hatImage.height / hatImage.width) * hatWidth;
      const hatX = centerX - hatWidth / 2;
      const hatY = centerY - faceRadius - hatHeight * 0.3;  // <-- ТУТ ОТСТУП
      ctx.drawImage(hatImage, hatX, hatY, hatWidth, hatHeight);
    }
  }
}
