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
        
        {/* Відображення картинки */}
        {displayedImage && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <img 
                src={displayedImage.url} 
                alt={displayedImage.caption}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
              {displayedImage.caption && (
                <p style={{
                  marginTop: '12px',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#333'
                }}>{displayedImage.caption}</p>
              )}
              <button 
                onClick={() => setDisplayedImage(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
      
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
