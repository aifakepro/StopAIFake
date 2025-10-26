/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { RefObject, useEffect, useState, useRef } from 'react';
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
  faceTextureUrl?: string; // ссылка на текстуру лица
  hatUrl?: string;         // ссылка на шапку
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
  faceTextureUrl = "https://i.ibb.co/TDnPTYzR/gptacp.jpg",
  hatUrl = "https://i.ibb.co/qLGqJRVy/nvidia.jpg",
}: BasicFaceProps) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const { volume } = useLiveAPIContext();
  const [isTalking, setIsTalking] = useState(false);

  const [scale, setScale] = useState(1);

  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking,
  });

  // Загружаем Canvas и изображения
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const faceImg = new Image();
    const hatImg = new Image();
    faceImg.crossOrigin = 'anonymous';
    hatImg.crossOrigin = 'anonymous';
    faceImg.src = faceTextureUrl;
    hatImg.src = hatUrl;

    faceImg.onload = () => {
      hatImg.onload = () => {
        const pattern = ctx.createPattern(faceImg, 'no-repeat')!;
        renderBasicFace({
          ctx,
          eyeScale,
          mouthScale,
          color,
          faceTexture: pattern,
          hatImg,
        });
      };
    };
  }, [canvasRef, eyeScale, mouthScale, color, faceTextureUrl, hatUrl]);

  // Определяем talking state по громкости
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsTalking(false), TALKING_STATE_COOLDOWN_MS);
    }
  }, [volume]);

  // Масштаб под окно
  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

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
