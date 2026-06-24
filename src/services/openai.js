const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

export async function askGameChatbot(message, options = {}) {
  const apiKey = options.apiKey;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are gamebot, a friendly Korean Discord chatbot focused on games. ' +
            'Reply in Korean by default. Keep answers concise, casual, and useful. ' +
            'For game recommendations, give a few concrete titles and why they fit. ' +
            'If the user asks for live Steam price details, suggest using /game for exact Steam lookup.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return extractOutputText(data);
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const textParts = [];

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join('\n').trim();
}
