export default function KeynoteCompanion() {
  const { client, connected, setConfig } = useLiveAPIContext();
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState<string>('');
  const user = useUser();
  const { current } = useAgent();

  // Настройка Live API з інструментами
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
      // Додаємо інструменти, якщо вони є у агента
      tools: current.tools?.map(tool => ({
        functionDeclarations: [{
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }]
      })) || []
    });
  }, [setConfig, user, current]);

  // ✅ Обробка виклику функції show_image від AI
  useEffect(() => {
    if (!client) return;

    const handleToolCall = (event: any) => {
      const functionCalls = event?.data?.toolCall?.functionCalls;
      
      if (functionCalls) {
        functionCalls.forEach((call: any) => {
          if (call.name === 'show_image') {
            const { imageUrl: url, caption } = call.args;
            setImageUrl(url || 'https://i.ibb.co/GfdcvnnD/bench.jpg');
            setImageCaption(caption || '');
            
            // Повертаємо результат AI
            client.sendToolResponse({
              functionResponses: [{
                name: 'show_image',
                response: { success: true, message: 'Зображення показано користувачу' }
              }]
            });
          }
        });
      }
    };

    client.addEventListener('toolcall', handleToolCall);
    return () => client.removeEventListener('toolcall', handleToolCall);
  }, [client]);

  return (
    <>
      <div className="keynote-companion relative">
        <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />
        
        {/* 🖼️ Показ зображення */}
        {imageUrl && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl">
              <img
                src={imageUrl}
                alt={imageCaption || 'Рекомендований лікар'}
                className="rounded-xl max-h-[70vh] w-full object-contain"
              />
              {imageCaption && (
                <p className="mt-4 text-center text-lg font-semibold text-gray-800">
                  {imageCaption}
                </p>
              )}
              <button
                className="mt-4 w-full px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium"
                onClick={() => {
                  setImageUrl(null);
                  setImageCaption('');
                }}
              >
                Закрити
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
