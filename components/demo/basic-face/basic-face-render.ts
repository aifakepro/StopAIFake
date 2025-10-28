import { RefObject, useEffect, useState, useRef } from 'react';

// Minimum volume level that indicates audio output is occurring
const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;
// Amount of delay between end of audio output and setting talking state to false
const TALKING_STATE_COOLDOWN_MS = 2000;

type BasicFaceProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  radius?: number;
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

function renderBasicFace(props: any) {
  const {
    ctx,
    eyeScale: eyesOpenness,
    mouthScale: mouthOpenness,
    color,
  } = props;
  const { width, height } = ctx.canvas;
  
  ctx.clearRect(0, 0, width, height);
  
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
  
  ctx.fillStyle = 'black';
  eye(ctx, eyesPosition[0], eyeRadius, eyesOpenness + 0.1);
  eye(ctx, eyesPosition[1], eyeRadius, eyesOpenness + 0.1);
  
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
}

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
}: BasicFaceProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [volume, setVolume] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [scale, setScale] = useState(0.1);
  const [eyeScale, setEyeScale] = useState(1);
  const [mouthScale, setMouthScale] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(0);

  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => setIsTalking(false),
        TALKING_STATE_COOLDOWN_MS
      );
    }
  }, [volume]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      renderBasicFace({ ctx, mouthScale, eyeScale, color });
    }
  }, [canvasRef, volume, eyeScale, mouthScale, color, scale]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg 
        id="hat" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 376.78 152.84"
        style={{
          position: 'absolute',
          width: radius * 2 * scale * 0.8,
          height: 'auto',
          top: -80 * scale,
          left: '50%',
          transform: `translateX(-50%) translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="-22.37" y1="132.91" x2="543.7" y2="132.91" gradientUnits="userSpaceOnUse">
            <stop offset="0.04" stopColor="#5092ff"/>
            <stop offset="0.53" stopColor="#7ec5ff"/>
            <stop offset="0.94" stopColor="#457fff"/>
          </linearGradient>
        </defs>
        <path d="M93.67,171.33c-.57-5,5.17-5.67,9.33-18,5.83-17.26-2.1-25.8-2-52.66.06-15.77.1-26.86,7.33-34.67,11-11.84,31.81-9,39.34-8,46.51,5.89,93.79-1,140.66,0,49.61,1.11,99.23,11.56,148.67,7.33,5.42-.46,19.73-1.84,27.33,6.67,8.49,9.49,1.69,23.5.67,51.33-1.21,32.81,7.33,37.64,3.33,48.67-8.77,24.18-82.27,38.53-190,36.67C99.47,205.57,94.86,181.87,93.67,171.33Z" transform="translate(-93.13 -56.49)" style={{stroke:'#5a90cc', strokeMiterlimit:10, fill:'url(#gradient)'}}/>
        <rect x="176.28" y="53.51" width="29.59" height="54" rx="8.33" style={{fill:'#dc5513'}}/>
        <rect x="269.81" y="105.6" width="29.59" height="64.79" rx="8.33" transform="translate(53.48 366.11) rotate(-90)" style={{fill:'#dc5513'}}/>
      </svg>
      <canvas
        className="basic-face"
        ref={canvasRef}
        width={radius * 2 * scale}
        height={radius * 2 * scale}
        style={{
          display: 'block',
          borderRadius: '50%',
          transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
        }}
      />
    </div>
  );
}
