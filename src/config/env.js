/**
 * Runtime configuration for Aura AI.
 *
 * Put secrets in a project-root `.env` file (gitignored).
 * Expo exposes only keys that start with EXPO_PUBLIC_.
 * Optional fallback: src/config/env.local.js
 */

let local = {};

try {
  local = require('./env.local');
} catch {
  local = {};
}

const trim = (value, fallback = '') => {
  if (value == null) {
    return fallback;
  }
  const next = String(value).trim();
  return next.length ? next : fallback;
};

const fromPublic = (name, localKey, fallback = '') =>
  trim(process.env[name]) || trim(local[localKey], fallback);

export const ENV = {
  OPENAI_API_KEY: fromPublic('EXPO_PUBLIC_OPENAI_API_KEY', 'OPENAI_API_KEY'),
  GEMINI_API_KEY: fromPublic('EXPO_PUBLIC_GEMINI_API_KEY', 'GEMINI_API_KEY'),
  OPENROUTER_API_KEY: fromPublic(
    'EXPO_PUBLIC_OPENROUTER_API_KEY',
    'OPENROUTER_API_KEY',
  ),
  OPENROUTER_SITE_URL: fromPublic(
    'EXPO_PUBLIC_OPENROUTER_SITE_URL',
    'OPENROUTER_SITE_URL',
    'https://github.com/aura-ai-mobile',
  ),
  OPENROUTER_APP_NAME: fromPublic(
    'EXPO_PUBLIC_OPENROUTER_APP_NAME',
    'OPENROUTER_APP_NAME',
    'Aura AI Mobile',
  ),

  SUPABASE_URL: fromPublic('EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'),
  SUPABASE_ANON_KEY: fromPublic(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  ),
};

export const getOpenAiKey = () => ENV.OPENAI_API_KEY;

export const hasOpenAiKey = () => Boolean(getOpenAiKey());
export const hasGeminiKey = () => Boolean(ENV.GEMINI_API_KEY);
export const hasOpenRouterKey = () => Boolean(ENV.OPENROUTER_API_KEY);
export const hasSupabaseConfig = () =>
  Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);

export const MODEL_CATALOG = {
  openai: [
    {id: 'gpt-4o-mini', label: 'GPT-4o Mini', hint: 'Fast default · OpenAI'},
    {id: 'gpt-4o', label: 'GPT-4o', hint: 'Strong multimodal'},
    {id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', hint: 'Newer small model'},
    {id: 'gpt-4.1', label: 'GPT-4.1', hint: 'Highest quality'},
  ],
  gemini: [
    {id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Fast, multimodal'},
    {id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', hint: 'Balanced default'},
    {id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', hint: 'Higher reasoning'},
  ],
  openrouter: [
    {
      id: 'openai/gpt-4o-mini',
      label: 'GPT-4o Mini',
      hint: 'OpenAI via OpenRouter',
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      label: 'Claude 3.5 Sonnet',
      hint: 'Anthropic via OpenRouter',
    },
    {
      id: 'google/gemini-flash-1.5',
      label: 'Gemini Flash 1.5',
      hint: 'Google via OpenRouter',
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      label: 'Llama 3.1 70B',
      hint: 'Meta via OpenRouter',
    },
  ],
};

export const labelForModel = (provider, modelId) => {
  const list = MODEL_CATALOG[provider] || [];
  return list.find((item) => item.id === modelId)?.label || modelId;
};
