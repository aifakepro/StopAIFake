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

  // Обробка tool calls від моделі
  useEffect(() => {
    if (!client || !connected) return;

    const handleToolCall = (toolCall: any) => {
      console.log('Tool call received:', toolCall); // Для отладки
      if (toolCall.name === 'show_image') {
        const { imageUrl, caption } = toolCall.parameters;
        setDisplayedImage({ url: imageUrl, caption: caption || '' });
        
        // Відправляємо відповідь моделі, що функція виконана
        client.sendToolResponse({
          functionResponses: [{
            name: 'show_image',
            id: toolCall.id,
            response: { success: true, message: 'Зображення показано користувачу' }
          }]
        });
      }
    };

    // Підписуємось на події tool calls
    client.on('toolcall', handleToolCall);

    return () => {
      client.off('toolcall', handleToolCall);
    };
  }, [client, connected]);

  // Set the configuration for the Live API
  useEffect(() => {
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
      tools: current.tools || [], // Додаємо tools до конфігурації
    });
  }, [setConfig, user, current]);

  return (
    <>
      <div className="keynote-companion">
        <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />
      </div>
      
      {/* Відображення картинки ПОВЕРХ всього */}
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
              onClick={() => setDisplayedImage(null)}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#cc0000';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ff4444';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
            <img 
              src={displayedImage.url} 
              alt={displayedImage.caption}
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
