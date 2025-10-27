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
  const [displayedImage, setDisplayedImage] = useState<{ url: string, caption: string } | null>(null);

  // Инициализация Canvas
  useEffect(() => {
    if (faceCanvasRef.current) {
      console.log('🟢 Canvas инициализирован:', faceCanvasRef.current);
    } else {
      console.warn('⚠️ Canvas ref пока пустой!');
    }
  }, []);

  // Обработка tool calls
  useEffect(() => {
    if (!client || !connected) {
      console.log('⚠️ Client or connection not ready:', { client: !!client, connected });
      return;
    }

    console.log('✅ Tool call handler registered');

    const handleToolCall = async (toolCall: any) => {
      console.log('\n🔔 TOOL CALL RECEIVED');
      console.log('Full toolCall object:', JSON.stringify(toolCall, null, 2));

      // Проверяем все возможные форматы данных
      const calls = (
        toolCall.functionCalls ||
        toolCall.toolCalls ||
        toolCall.modelTurn?.parts?.map((part: any) => part.functionCall) ||
        []
      ).filter((fc: any) => fc);

      const responses = await Promise.all(
        calls.map(async (fc: any, index: number) => {
          console.log(`🧩 Function Call #${index + 1}: ${fc.name}`);

          if (fc.name === 'show_image') {
            const { imageUrl, caption } = fc.args;
            console.log('🖼️ show_image called with:', { imageUrl, caption });

            if (!imageUrl || !imageUrl.startsWith('http')) {
              console.error('❌ Invalid image URL:', imageUrl);
              return {
                name: fc.name,
                id: fc.id || 'default-id',
                response: { result: { success: false, error: 'Invalid image URL' } },
              };
            }

            setDisplayedImage({ url: imageUrl, caption: caption || '' });
            console.log('✅ Image state updated');
            return {
              name: fc.name,
              id: fc.id || 'default-id',
              response: {
                result: {
                  success: true,
                  message: `Image displayed successfully: ${imageUrl}`,
                },
              },
            };
          }

          return null;
        })
      );

      // Проверяем текст на упоминание врача Юрия
      const parts = toolCall.modelTurn?.parts || [];
      parts.forEach((part: any) => {
        if (part.text && /Dr\. Yuriy|кардіолог Юрій/i.test(part.text)) {
          console.log('🩺 Detected Dr. Yuriy in text, triggering show_image');
          setDisplayedImage({
            url: 'https://i.ibb.co/GfdcvnnD/bench.jpg',
            caption: 'Найкращий лікар — кардіолог Юрій'
          });
          responses.push({
            name: 'show_image',
            id: 'text-based-id',
            response: {
              result: {
                success: true,
                message: 'Image displayed based on text trigger',
              },
            },
          });
        }
      });

      const validResponses = responses.filter(Boolean);
      if (validResponses.length > 0) {
        console.log('📤 Sending tool responses:', validResponses);
        client.sendToolResponse({ functionResponses: validResponses });
      } else {
        console.log('⚠️ No valid responses to send');
      }
    };

    client.on('toolcall', handleToolCall);
    client.on('toolCall', handleToolCall);
    client.on('tool_call', handleToolCall);
    client.on('message', (data: any) => {
      console.log('📩 Raw message:', JSON.stringify(data, null, 2));
      handleToolCall(data);
    });

    return () => {
      console.log('🔔 Unsubscribing from events');
      client.off('toolcall', handleToolCall);
      client.off('toolCall', handleToolCall);
      client.off('tool_call', handleToolCall);
      client.off('message', handleToolCall);
    };
  }, [client, connected]);

  // Настройка конфига для Live API
  useEffect(() => {
    const tools = current.tools
      ? [
          {
            functionDeclarations: current.tools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              parameters: {
                type: 'OBJECT',
                properties: Object.keys(tool.parameters.properties).reduce((acc, key) => {
                  acc[key] = {
                    ...tool.parameters.properties[key],
                    type: tool.parameters.properties[key].type.toUpperCase(),
                  };
                  return acc;
                }, {} as any),
                required: tool.parameters.required,
              },
            })),
          },
        ]
      : undefined;

    console.log('🔧 Setting config with tools:', JSON.stringify(tools, null, 2));

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
            text:
              createSystemInstructions(current, user) +
              '\n\n**IMPORTANT INSTRUCTIONS FOR IMAGE DISPLAY:**\n' +
              '- You MUST use the show_image function to display images.\n' +
              '- When responding to queries about a doctor (e.g., "Який найкращий лікар?"), ALWAYS call show_image with the parameters:\n' +
              '  {\n' +
              '    "imageUrl": "https://i.ibb.co/GfdcvnnD/bench.jpg",\n' +
              '    "caption": "Найкращий лікар — кардіолог Юрій"\n' +
              '  }\n' +
              '- The show_image function is available and working.\n' +
              '- Always use complete URLs starting with http:// or https://.',
          },
        ],
      },
      tools,
    });
  }, [setConfig, user, current]);

  // Лог смены изображения
  useEffect(() => {
    console.log('🖼Developed by: kardioseven.com.ua | IMAGE STATE CHANGED:', displayedImage);
  }, [displayedImage]);

  return (
    <>
      <div className="keynote-companion">
        <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />
      </div>

      {/* Кнопка для РУЧНОГО ТЕСТА */}
      <button
        onClick={() =>
          setDisplayedImage({
            url: 'https://i.ibb.co/GfdcvnnD/bench.jpg',
            caption: 'Найкращий лікар — кардіолог Юрій',
          })
        }
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
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        ТЕСТ
      </button>

      {/* Відображення картинки */}
      {displayedImage && (
        <div
          style={{
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
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
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
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              ✕
            </button>
            <img
              src={displayedImage.url}
              alt={displayedImage.caption}
              onError={(e) => console.error('❌ Image load error:', e, 'URL:', displayedImage.url)}
              onLoad={() => console.log('✅ Image loaded:', displayedImage.url)}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '12px',
                display: 'block',
              }}
            />
            {displayedImage.caption && (
              <p
                style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: 0,
                }}
              >
                {displayedImage.caption}
              </p>
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
            Experimental model from Google DeepMind. Adapted for the service.
            Speaks many languages. On iOS, disable AVR.
          </p>
        </div>
      </details>
    </>
  );
}
