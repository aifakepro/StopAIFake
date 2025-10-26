/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { RefObject, useEffect, useState, useRef } from 'react';
import { renderBasicFace, preloadFaceTexture, preloadHat } from './basic-face-render';
import useFace from '../../../hooks/demo/use-face';
import useHover from '../../../hooks/demo/use-hover';
import useTilt from '../../../hooks/demo/use-tilt';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

// Thresholds for detecting talking
const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;
const TALKING_STATE_COOLDOWN_MS = 2000;

type BasicFaceProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  radius?: number;
  color?: string;
  faceTextureUrl?: string; // просто указываем, что это string
  hatUrl?: string;
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
  faceTextureUrl = "https://i.ibb.co/TDnPTYzR/gptacp.jpg",
  hatUrl = "https://i.ibb.co/qLGqJRVy/nvidia.jpg",
}: BasicFaceProps) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Audio output volume
  const { volume } = useLiveAPIContext();
  const [isTalking, setIsTalking] = useState(false);

  // Scaling
  const [scale, setScale] = useState(1);

  // Preloaded images
  const [faceTexture, setFaceTexture] = useState<CanvasPattern | null>(null);
  const [hatImg, setHatImg] = useState<HTMLImageElement | null>(null);

  // Face state
  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking,
  });

  // Handle window resize scaling
  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Detect talking state from volume
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsTalking(false), TALKING_STATE_COOLDOWN_MS);
    }
  }, [volume]);

  // Preload face texture
 useEffect(() => {
  const ctx = canvasRef.current?.getContext('2d');
  if (!ctx || !faceTextureUrl || !hatUrl) return;

  const faceImg = new Image();
  const hatImg = new Image();
  faceImg.crossOrigin = 'anonymous';
  hatImg.crossOrigin = 'anonymous';
  faceImg.src = faceTextureUrl;
  hatImg.src = hatUrl;

  faceImg.onload = () => {
    hatImg.onload = () => {
      const pattern = ctx.createPattern(faceImg, 'no-repeat')!;
      renderBasicFace({ ctx, eyeScale, mouthScale, color, faceTexture: pattern, hatImg });
    };
  };
}, [canvasRef, eyeScale, mouthScale, color, faceTextureUrl, hatUrl]);


  // Preload hat image
  useEffect(() => {
    if (!hatUrl) return;
    preloadHat(hatUrl).then(setHatImg);
  }, [hatUrl]);

  // Render the face on the canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    renderBasicFace({
      ctx,
      eyeScale,
      mouthScale,
      color,
      faceTexture: faceTexture || undefined,
      hatImg: hatImg || undefined,
    });
  }, [canvasRef, eyeScale, mouthScale, color, faceTexture, hatImg, scale]);

  return (
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
  );
}
