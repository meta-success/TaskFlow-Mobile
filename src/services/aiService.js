/**
 * Cloud generative AI gateway.
 *
 * Default path is the official OpenAI API (your own `sk-` key).
 * Gemini and OpenRouter remain available as optional fallbacks.
 */

import {GoogleGenerativeAI} from '@google/generative-ai';
import {
  ENV,
  getOpenAiKey,
  hasGeminiKey,
  hasOpenAiKey,
  hasOpenRouterKey,
} from '../config/env';

const DEFAULT_SYSTEM_PROMPT =
  'You are Aura, a refined mobile AI companion. Be warm, concise, and precise. When source context is provided, ground answers in that context and say when it is insufficient.';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_EMBED_URL = 'https://api.openai.com/v1/embeddings';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const toUserFacingError = (error, provider) => {
  const message = error?.message || String(error);
  if (/api key|unauthorized|401|incorrect api/i.test(message)) {
    return `${provider} rejected the key. Add a valid OpenAI key in Settings.`;
  }
  if (/quota|429|billing/i.test(message)) {
    return `${provider} quota or billing issue. Check your OpenAI account.`;
  }
  if (/network|failed to fetch|timeout/i.test(message)) {
    return `Could not reach ${provider}. Check your connection and try again.`;
  }
  return `${provider} error: ${message}`;
};

const buildSystemPrompt = (systemPrompt, ragContext) => {
  const base = systemPrompt || DEFAULT_SYSTEM_PROMPT;
  if (!ragContext) {
    return base;
  }
  return `${base}

Use the following retrieved knowledge-base excerpts when they are relevant.
If they do not contain the answer, say so clearly.

<retrieved_context>
${ragContext}
</retrieved_context>`;
};

const toOpenAiMessages = (messages, systemPrompt, ragContext) => [
  {role: 'system', content: buildSystemPrompt(systemPrompt, ragContext)},
  ...messages
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .map((item) => ({
      role: item.role,
      content: item.content,
    })),
];

export async function generateWithOpenAI({
  messages,
  model,
  systemPrompt,
  ragContext,
}) {
  if (!hasOpenAiKey()) {
    throw new Error(
      'OpenAI API key is missing. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file and restart Expo.',
    );
  }

  const payload = {
    model: model || 'gpt-4o-mini',
    messages: toOpenAiMessages(messages, systemPrompt, ragContext),
    temperature: 0.7,
  };

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getOpenAiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `HTTP ${response.status}`);
  }

  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  return {
    content,
    provider: 'openai',
    model: data?.model || payload.model,
  };
}

export async function embedWithOpenAI(text) {
  if (!hasOpenAiKey()) {
    return null;
  }

  const response = await fetch(OPENAI_EMBED_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getOpenAiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `HTTP ${response.status}`);
  }
  return data?.data?.[0]?.embedding || null;
}

const toGeminiHistory = (messages) =>
  messages
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{text: item.content}],
    }));

const extractGeminiText = (response) => {
  const text = response?.text?.();
  if (text) {
    return text.trim();
  }
  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part.text || '')
    .join('')
    .trim();
};

export async function generateWithGemini({
  messages,
  model,
  systemPrompt,
  ragContext,
}) {
  if (!hasGeminiKey()) {
    throw new Error(
      'Gemini API key is missing. Add GEMINI_API_KEY to src/config/env.local.js.',
    );
  }

  const client = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  const generativeModel = client.getGenerativeModel({
    model: model || 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(systemPrompt, ragContext),
  });

  const history = toGeminiHistory(messages);
  const last = history[history.length - 1];
  if (!last || last.role !== 'user') {
    throw new Error('Gemini requires the latest message to come from the user.');
  }

  const chat = generativeModel.startChat({
    history: history.slice(0, -1),
  });
  const result = await chat.sendMessage(last.parts[0].text);
  const content = extractGeminiText(result.response);
  if (!content) {
    throw new Error('Gemini returned an empty response.');
  }

  return {
    content,
    provider: 'gemini',
    model: model || 'gemini-2.0-flash',
  };
}

export async function generateWithOpenRouter({
  messages,
  model,
  systemPrompt,
  ragContext,
}) {
  if (!hasOpenRouterKey()) {
    throw new Error(
      'OpenRouter API key is missing. Add OPENROUTER_API_KEY to src/config/env.local.js.',
    );
  }

  const payload = {
    model: model || 'openai/gpt-4o-mini',
    messages: toOpenAiMessages(messages, systemPrompt, ragContext),
    temperature: 0.7,
  };

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ENV.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': ENV.OPENROUTER_SITE_URL,
      'X-Title': ENV.OPENROUTER_APP_NAME,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `HTTP ${response.status}`);
  }

  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return {
    content,
    provider: 'openrouter',
    model: data?.model || payload.model,
  };
}

export async function embedWithGemini(text) {
  if (!hasGeminiKey()) {
    return null;
  }

  const client = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  const model = client.getGenerativeModel({model: 'text-embedding-004'});
  const result = await model.embedContent(text);
  return result?.embedding?.values || null;
}

export async function generateChatResponse({
  messages,
  provider = 'openai',
  openaiModel,
  geminiModel,
  openrouterModel,
  systemPrompt,
  ragContext,
}) {
  const canOpenAI = hasOpenAiKey();
  const canGemini = hasGeminiKey();
  const canOpenRouter = hasOpenRouterKey();

  const runOpenAI = () =>
    generateWithOpenAI({
      messages,
      model: openaiModel,
      systemPrompt,
      ragContext,
    });

  try {
    if (provider === 'openai' || (provider === 'auto' && canOpenAI)) {
      return await runOpenAI();
    }
    if (provider === 'gemini' && canGemini) {
      return await generateWithGemini({
        messages,
        model: geminiModel,
        systemPrompt,
        ragContext,
      });
    }
    if (provider === 'openrouter' && canOpenRouter) {
      return await generateWithOpenRouter({
        messages,
        model: openrouterModel,
        systemPrompt,
        ragContext,
      });
    }
    if (canOpenAI) {
      return await runOpenAI();
    }
    if (canGemini) {
      return await generateWithGemini({
        messages,
        model: geminiModel,
        systemPrompt,
        ragContext,
      });
    }
    if (canOpenRouter) {
      return await generateWithOpenRouter({
        messages,
        model: openrouterModel,
        systemPrompt,
        ragContext,
      });
    }
    throw new Error(
      'No cloud AI provider is configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file and restart Expo.',
    );
  } catch (error) {
    const label =
      provider === 'openai'
        ? 'OpenAI'
        : provider === 'openrouter'
          ? 'OpenRouter'
          : provider === 'gemini'
            ? 'Gemini'
            : 'Cloud AI';
    throw new Error(toUserFacingError(error, label));
  }
}
