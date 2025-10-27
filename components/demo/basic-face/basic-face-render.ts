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
  /** URL текстуры для круга (можно использовать прямую ссылку на изображение) */
  textureUrl?: string;
  /** URL изображения шапки (можно использовать прямую ссылку на изображение) */
  hatUrl?: string;
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
  textureUrl = "https://ваша-ссылка-на-текстуру.png", // СЮДА вставьте ссылку на текстуру
  hatUrl = "https://ваша-ссылка-на-шапку.png", // СЮДА вставьте ссылку на шапку
}: BasicFaceProps) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const textureImageRef = useRef<HTMLImageElement | null>(null);
  const hatImageRef = useRef<HTMLImageElement | null>(null);
  
  // Audio output volume
  const { volume } = useLiveAPIContext();
  // Talking state
  const [isTalking, setIsTalking] = useState(false);
  const [scale, setScale] = useState(0.1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Face state
  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking,
  });

  // Load images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = (textureUrl ? 1 : 0) + (hatUrl ? 1 : 0);
    
    if (totalImages === 0) {
      setImagesLoaded(true);
      return;
    }
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
      }
    };
    
    if (textureUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = textureUrl;
      textureImageRef.current = img;
    }
    
    if (hatUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = hatUrl;
      hatImageRef.current = img;
    }
  }, [textureUrl, hatUrl]);

  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Detect whether the agent is talking based on audio output volume
  // Set talking state when volume is detected
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Enforce a slight delay between end of audio output and setting talking state to false
      timeoutRef.current = setTimeout(
        () => setIsTalking(false),
        TALKING_STATE_COOLDOWN_MS
      );
    }
  }, [volume]);

  // Render the face on the canvas
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const ctx = canvasRef.current?.getContext('2d')!;
    renderBasicFace({ 
      ctx, 
      mouthScale, 
      eyeScale, 
      color,
      textureImage: textureImageRef.current || undefined,
      hatImage: hatImageRef.current || undefined,
    });
  }, [canvasRef, volume, eyeScale, mouthScale, color, scale, imagesLoaded]);

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
