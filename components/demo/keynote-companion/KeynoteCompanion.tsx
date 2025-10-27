/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';
import { Modality } from '@google/genai';
import BasicFace from '../basic-face/BasicFace';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { createSystemInstructions } from '@/lib/prompts';
import { useAgent, useUser } from '@/lib/state';

export default function KeynoteCompanion() {
  const { client, connected, setConfig } = useLiveAPIContext();
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const user = useUser();
  const { current } = useAgent();

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
    });
  }, [setConfig, user, current]);

  // Показ зображення при питанні про лікаря
  useEffect(() => {
    if (!client) return;

    const handleMessage = (event: any) => {
      const text = (event?.serverContent?.modelTurn?.parts?.[0]?.text || '').toLowerCase();
      
      if (text.includes('юрій') || text.includes('лікар')) {
        setImageUrl('https://i.ibb.co/GfdcvnnD/bench.jpg');
      }
    };

    client.addEventListener('message', handleMessage);
    return () => client.removeEventListener('message', handleMessage);
  }, [client]);
  
  return (
    <>
      <div className="keynote-companion">
        <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />
      </div>

      {imageUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px'
          }}>
            <img
              src={imageUrl}
              alt="Кардіолог Юрій"
              style={{
                borderRadius: '12px',
                maxHeight: '70vh',
                width: '100%'
              }}
            />
            <button
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setImageUrl(null)}
            >
              Закрити
            </button>
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
