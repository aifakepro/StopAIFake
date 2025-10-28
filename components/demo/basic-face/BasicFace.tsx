/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RefObject, useEffect, useState, useRef } from 'react';
import { renderBasicFace, renderIcon } from './basic-face-render';
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
  const hatCanvasRef = useRef<HTMLCanvasElement>(null);

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

  // вычисляем общий масштаб
  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // определяем, "говорит" ли агент
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

  // рендер лица
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) renderBasicFace({ ctx, mouthScale, eyeScale, color });
  }, [canvasRef, volume, eyeScale, mouthScale, color, scale]);

  // рендер шляпы
  useEffect(() => {
    const ctx = hatCanvasRef.current?.getContext('2d');
    if (ctx) renderIcon({ ctx });
  }, [scale]);

  const canvasSize = radius * 2 * scale;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        transform: 'scale(1.3)', // увеличивает весь контейнер
        transformOrigin: 'center',
      }}
    >
      {/* Лицо */}
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

      {/* Новый канвас с шляпой */}
      <canvas
        className="hat-overlay"
        ref={hatCanvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: `translateX(-50%) translateY(${hoverPosition - 80}px) rotate(${tiltAngle}deg)`,
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
