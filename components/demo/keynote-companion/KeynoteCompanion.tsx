import { useEffect, useRef, useState } from 'react';
import { Modality } from '@google/genai';
import BasicFace from '../basic-face/BasicFace';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { createSystemInstructions } from '@/lib/prompts';
import { useAgent, useUser } from '@/lib/state';

export default function KeynoteCompanion() {
  const { client, connected, setConfig } = useLiveAPIContext();
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const user = useUser();
  const { current } = useAgent();
  const [displayedImage, setDisplayedImage] = useState<{url: string, caption: string} | null>(null);

  // ТЕСТ - показать изображение сразу для проверки
  useEffect(() => {
    // Раскомментируйте эту строку для теста
    // setDisplayedImage({ url: 'https://i.ibb.co/GfdcvnnD/bench.jpg', caption: 'ТЕСТ' });
  }, []);

  // Обробка tool calls від моделі
  useEffect(() => {
    if (!client || !connected) {
      console.log('Client not ready:', { client: !!client, connected });
      return;
    }

    console.log('Setting up tool call listener');

    const handleToolCall = (toolCall: any) => {
      console.log('=== Tool call received ===', toolCall);
      console.log('Tool name:', toolCall?.name);
      console.log('Tool parameters:', toolCall?.parameters);
      
      if (toolCall.name === 'show_image') {
        const { imageUrl, caption } = toolCall.parameters;
        console.log('Setting image:', { imageUrl, caption });
        setDisplayedImage({ url: imageUrl, caption: caption || '' });
        
        // Відправляємо відповідь моделі
        if (client.sendToolResponse) {
          client.sendToolResponse({
            functionResponses: [{
              name: 'show_image',
              id: toolCall.id,
              response: { success: true, message: 'Зображення показано користувачу' }
            }]
          });
        }
      }
    };

    // Спробуємо різні варіанти підписки
    if (client.on) {
      client.on('toolcall', handleToolCall);
      client.on('toolCall', handleToolCall);
      client.on('functioncall', handleToolCall);
      console.log('Subscribed to tool call events');
    }

    return () => {
      if (client.off) {
        client.off('toolcall', handleToolCall);
        client.off('toolCall', handleToolCall);
        client.off('functioncall', handleToolCall);
      }
    };
  }, [client, connected]);

  // Логируем состояние displayedImage
  useEffect(() => {
    console.log('displayedImage state changed:', displayedImage);
  }, [displayedImage]);

  // Set the configuration for the Live API
  useEffect(() => {
    console.log('Setting config with tools:', current.tools);
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: current.voice },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: createSystemInstructions(current, user),
          },
        ],
      },
      tools: current.tools || [],
    });
  }, [setConfig, user, current]);

  console.log('Render - displayedImage:', displayedImage);

  return (
    <>
      <div className="keynote-companion">
        <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />
      </div>
      
      {/* Кнопка для РУЧНОГО ТЕСТА */}
      <button 
        onClick={() => setDisplayedImage({ 
          url: 'https://i.ibb.co/GfdcvnnD/bench.jpg', 
          caption: 'Тестове зображення' 
        })}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        ТЕСТ: Показати фото
      </button>
      
      {/* Відображення картинки */}
      {displayedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%',
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => {
                console.log('Closing image');
                setDisplayedImage(null);
              }}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              ✕
            </button>
            <img 
              src={displayedImage.url} 
              alt={displayedImage.caption}
              onError={(e) => console.error('Image failed to load:', e)}
              onLoad={() => console.log('Image loaded successfully')}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '12px',
                display: 'block'
              }}
            />
            {displayedImage.caption && (
              <p style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 600,
                color: '#333',
                marginBottom: 0
              }}>{displayedImage.caption}</p>
            )}
          </div>
        </div>
      )}
      
      <details className="info-overlay">
        <summary className="info-button">
          <span className="icon">info</span>
        </summary>
        <div className="info-text">
          <p>
            Experimental model from Google DeepMind. Adapted for the service. Speaks many languages. On iOS, disable AVR.
          </p>
        </div>
      </details>
    </>
  );
}
