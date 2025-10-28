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
  /** Path to texture image - default: '/path/to/texture.png' */
  texturePath?: string;
  /** Path to hat image - default: '/path/to/hat.png' */
  hatPath?: string;
};

// Настройка canvas для четкости на Retina дисплеях
const setupCanvas = (canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) => {
  const dpr = window.devicePixelRatio || 1;
  
  // Устанавливаем физический размер canvas
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  
  // Устанавливаем CSS размер (логический)
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  
  // Масштабируем контекст
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  
  return ctx;
};

export default function BasicFace({
  canvasRef,
  radius = 250,
  color,
  texturePath,
  hatPath,
}: BasicFaceProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio output volume
  const { volume } = useLiveAPIContext();
  
  // Talking state
  const [isTalking, setIsTalking] = useState(false);
  const [scale, setScale] = useState(0.1);
  
  // Face state
  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking,
  });
  
  // Image loading
  const [textureImage, setTextureImage] = useState<HTMLImageElement | null>(null);
  const [hatImage, setHatImage] = useState<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Load texture and hat images
  useEffect(() => {
    const TEXTURE_URL = texturePath || 'https://i.ibb.co/7dNm0Ksz/BOTmed1.jpg';
    const HAT_URL = hatPath || 'https://i.ibb.co/mVxKD0T8/kapBot1.png';
    
    let textureLoaded = false;
    let hatLoaded = false;
    
    const checkIfAllLoaded = () => {
      if (textureLoaded && hatLoaded) {
        setImagesLoaded(true);
      }
    };
    
    if (TEXTURE_URL) {
      const texture = new Image();
      texture.crossOrigin = 'anonymous';
      texture.src = TEXTURE_URL;
      texture.onload = () => {
        setTextureImage(texture);
        textureLoaded = true;
        checkIfAllLoaded();
      };
      texture.onerror = () => {
        console.error('Failed to load texture from:', TEXTURE_URL);
        textureLoaded = true;
        checkIfAllLoaded();
      };
    } else {
      textureLoaded = true;
    }
    
    if (HAT_URL) {
      const hat = new Image();
      hat.crossOrigin = 'anonymous';
      hat.src = HAT_URL;
      hat.onload = () => {
        setHatImage(hat);
        hatLoaded = true;
        checkIfAllLoaded();
      };
      hat.onerror = () => {
        console.error('Failed to load hat from:', HAT_URL);
        hatLoaded = true;
        checkIfAllLoaded();
      };
    } else {
      hatLoaded = true;
    }
  }, [texturePath, hatPath]);
  
  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);
  
  // Setup canvas with proper DPR when scale changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const logicalWidth = radius * 2 * scale;
    const logicalHeight = radius * 2 * scale;
    
    setupCanvas(canvas, logicalWidth, logicalHeight);
  }, [canvasRef, radius, scale]);
  
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
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    renderBasicFace({ 
      ctx, 
      mouthScale, 
      eyeScale, 
      color,
      textureImage,
      hatImage
    });
  }, [canvasRef, volume, eyeScale, mouthScale, color, scale, textureImage, hatImage, imagesLoaded]);
  
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
