/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { RefObject, useEffect, useState } from 'react';
import { renderBasicFace } from './basic-face-render';
import useFace from '../../../hooks/demo/use-face';
import useHover from '../../../hooks/demo/use-hover';
import useTilt from '../../../hooks/demo/use-tilt';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;
const TALKING_STATE_COOLDOWN_MS = 2000;

type BasicFaceProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  radius?: number;
  color?: string;
  faceTextureUrl?: string;
  hatUrl?: string;
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color = '#fff',
  faceTextureUrl = 'https://i.ibb.co/TDnPTYzR/gptacp.jpg',
  hatUrl = 'https://i.ibb.co/qLGqJRVy/nvidia.jpg',
}: BasicFaceProps) {
  const { volume } = useLiveAPIContext();
  const [isTalking, setIsTalking] = useState(false);
  const [scale, setScale] = useState(1);
  const [faceTexture, setFaceTexture] = useState<CanvasPattern | null>(null);
  const [hatImg, setHatImg] = useState<HTMLImageElement | null>(null);
  const timeoutRef = useState<NodeJS.Timeout | null>(null)[0];

  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({ maxAngle: 5, speed: 0.075, isActive: isTalking });

  // Масштаб под размер окна
  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Talking state
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef) clearTimeout(timeoutRef);
      timeoutRef = setTimeout(() => setIsTalking(false), TALKING_STATE_COOLDOWN_MS);
    }
  }, [volume]);

  // Загрузка текстуры лица и шапки
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !faceTextureUrl || !hatUrl) return;

    const faceImg = new Image();
    const hat = new Image();
    faceImg.crossOrigin = 'anonymous';
    hat.crossOrigin = 'anonymous';
    faceImg.src = faceTextureUrl;
    hat.src = hatUrl;

    faceImg.onload = () => {
      const pattern = ctx.createPattern(faceImg, 'no-repeat')!;
      setFaceTexture(pattern);
      setHatImg(hat);
    };
  }, [canvasRef, faceTextureUrl, hatUrl]);

  // Рендер лица
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !faceTexture || !hatImg) return;

    renderBasicFace({
      ctx,
      eyeScale,
      mouthScale,
      color,
      faceTexture,
      hatImg,
    });
  }, [canvasRef, eyeScale, mouthScale, color, scale, faceTexture, hatImg]);

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
