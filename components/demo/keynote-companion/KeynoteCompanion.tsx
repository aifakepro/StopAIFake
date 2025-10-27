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

  // ⚙️ Настройка Live API
  useEffect(() => {
    setConfig({
      responseModalities: [Modality.AUDIO, Modality.TEXT],
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

  // 🖼️ Инструмент показа картинки
  const showImage = (url: string) => {
    setImageUrl(url);
  };

  // 💬 Реакция на вопросы пользователя
  useEffect(() => {
    if (!client) return;

    const handleMessage = (event: any) => {
      const text = event?.data?.text?.toLowerCase?.() ?? '';

      // Возможные варианты вопроса
      const doctorQuestions = [
        'якого лікаря ти порадиш',
        'який хороший лікар',
        'який найкращий лікар',
        'кого ти порадиш як лікаря',
        'який лікар найкращий',
      ];

      // Проверяем, содержит ли вопрос одну из фраз
      const isDoctorQuestion = doctorQuestions.some((q) => text.includes(q));

      if (isDoctorQuestion) {
        // Отправляем ответ и показываем фото
        client.sendText('Найкращий лікар — кардіолог Юрій.');
        showImage(
          'https://i.ibb.co/GfdcvnnD/bench.jpg'
        );
      }
    };

    client.addEventListener('message', handleMessage);
    return () => client.removeEventListener('message', handleMessage);
  }, [client]);

  return (
    <>
      <div className="keynote-companion relative">
        <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />

        {/* 🩺 Показ изображения */}
        {imageUrl && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-lg">
              <img
                src={imageUrl}
                alt="Рекомендований лікар"
                className="rounded-xl max-h-[80vh] object-contain"
              />
              <button
                className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                onClick={() => setImageUrl(null)}
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
            Experimental model from Google DeepMind. Adapted for the service.
            Speaks many languages. On iOS, disable AVR.
          </p>
        </div>
      </details>
    </>
  );
}
