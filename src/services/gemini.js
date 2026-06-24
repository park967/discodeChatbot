const GEMINI_GENERATE_CONTENT_URL = 'https://generativelanguage.googleapis.com/v1beta';

export async function askGeminiChatbot(message, options = {}) {
  const apiKey = options.apiKey;

  if (!apiKey) {
    return null;
  }

  const model = normalizeModelName(options.model || 'gemini-2.5-flash');
  const url = `${GEMINI_GENERATE_CONTENT_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              'You are gamebot, a friendly Korean Discord chatbot focused on games. ' +
              'Reply in Korean by default. Keep answers concise, casual, and useful. ' +
              'For game recommendations, give a few concrete titles and why they fit. ' +
              'If the user asks for live Steam price details, suggest using /game for exact Steam lookup.',
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return extractOutputText(data);
}

function extractOutputText(data) {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim() || ''
  );
}

function normalizeModelName(model) {
  return model.startsWith('models/') ? model : `models/${model}`;
}
