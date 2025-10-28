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

// Кэш для загруженных изображений
const imageCache: { [key: string]: HTMLImageElement } = {};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  if (imageCache[url]) {
    return Promise.resolve(imageCache[url]);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[url] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
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
  
  // Try to draw texture
  const textureImg = imageCache['https://i.ibb.co/7dNm0Ksz/BOTmed1.jpg'];
  if (textureImg && textureImg.complete) {
    ctx.globalAlpha = 1.0;
    ctx.drawImage(textureImg, centerX - faceRadius, centerY - faceRadius, faceRadius * 2, faceRadius * 2);
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
  
  // Draw the hat (SVG version)
  const svgText = `
  <svg id="Шар_3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 376.78 152.84">
    <defs>
      <linearGradient id="Градієнт_без_назви_266" x1="-22.37" y1="132.91" x2="543.7" y2="132.91" gradientUnits="userSpaceOnUse">
        <stop offset="0.04" stop-color="#5092ff"/>
        <stop offset="0.53" stop-color="#7ec5ff"/>
        <stop offset="0.94" stop-color="#457fff"/>
      </linearGradient>
    </defs>
    <path d="M93.67,171.33c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66.06-15.77.1-26.86,7.33-34.67,11-11.84,31.81-9,39.34-8,46.51,5.89,93.79-1,140.66,0,49.61,1.11,99.23,11.56,148.67,7.33,5.42-.46,19.73-1.84,27.33,6.67,8.49,9.49,1.69,23.5.67,51.33-1.21,32.81,7.33,37.64,3.33,48.67-8.77,24.18-82.27,38.53-190,36.67C99.47,205.57,94.86,181.87,93.67,171.33Z" transform="translate(-93.13 -56.49)" style="stroke:#5a90cc;stroke-miterlimit:10;fill:url(#Градієнт_без_назви_266)"/>
    <rect x="176.28" y="53.51" width="29.59" height="54" rx="8.33" style="fill:#dc5513"/>
    <rect x="269.81" y="105.6" width="29.59" height="64.79" rx="8.33" transform="translate(53.48 366.11) rotate(-90)" style="fill:#dc5513"/>
  </svg>
  `;
  
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  loadImage(url).then(svgImg => {
    const isMobile = width < 780;
    const hatWidth = isMobile ? width * 0.7 : width * 1.4;
    const hatHeight = hatWidth * (152.84 / 376.78);
    const hatX = centerX - hatWidth / 2;
    const hatY = centerY - faceRadius - hatHeight * (isMobile ? 0.15 : 0.3);
  
    ctx.drawImage(svgImg, hatX, hatY, hatWidth, hatHeight);
    URL.revokeObjectURL(url);
  }).catch(console.error);
}

// Предзагрузка изображений
loadImage('https://i.ibb.co/7dNm0Ksz/BOTmed1.jpg').catch(console.error);
loadImage('https://i.ibb.co/mVxKD0T8/kapBot1.png').catch(console.error);
