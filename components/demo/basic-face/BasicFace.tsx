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

// Minimum volume level that indicates audio output is occurring
const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;

// Amount of delay between end of audio output and setting talking state to false
const TALKING_STATE_COOLDOWN_MS = 2000;

type BasicFaceProps = {
  /** The canvas element on which to render the face. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** The radius of the face. */
  radius?: number;
  /** The color of the face. */
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

  // Устанавливаем правильное разрешение canvas с учётом DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = radius * 2 * scale;
    const displayHeight = radius * 2 * scale;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [canvasRef, radius, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    renderBasicFace({ ctx, mouthScale, eyeScale, color });
  }, [canvasRef, volume, eyeScale, mouthScale, color, scale]);

  return (
    <canvas
      className="basic-face"
      ref={canvasRef}
      style={{
        display: 'block',
        transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
      }}
    />
  );
}
