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
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
}: BasicFaceProps) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const { volume } = useLiveAPIContext();
  const [isTalking, setIsTalking] = useState(false);
  const [scale, setScale] = useState(0.1);

  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking,
  });

  // Вычисляем масштаб
  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Определяем, говорит ли агент
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

  // Рендер лица (включая шляпу)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) renderBasicFace({ ctx, mouthScale, eyeScale, color });
  }, [canvasRef, volume, eyeScale, mouthScale, color, scale]);

  const canvasSize = radius * 2 * scale;

  return (
    <canvas
      className="basic-face"
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        display: 'block',
        borderRadius: '50%',
        transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
      }}
    />
  );
}
