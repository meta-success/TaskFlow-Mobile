# Aura AI Mobile

Professional proof-of-work for an **Expo** React Native app that combines **cloud generative AI**, **on-device inference**, **RAG**, and **Supabase** identity.

Aura is a dark, production-styled assistant. The default cloud path is **your OpenAI API key**. Gemini and OpenRouter stay available as optional fallbacks, and a TensorFlow.js model answers on-device when you are offline.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Aura AI Mobile                           │
│                     Expo SDK 57 + React Native                   │
│                                                                  │
│   Home · Chat · Knowledge · Settings                             │
│              │                                                   │
│              ▼                                                   │
│        Zustand store                                             │
│   (auth, chats, documents, provider, online flag)                │
│              │                                                   │
│      ┌───────┴────────┬──────────────────┐                       │
│      ▼                ▼                  ▼                       │
│ aiService.js    onDeviceModel.js     ragService.js               │
│  OpenAI fetch    TFJS CPU             chunk → embed              │
│  Gemini /        sentiment +          retrieve top-k             │
│  OpenRouter      local embeddings     augment prompt             │
└──────┬─────────────────┬─────────────────┬───────────────────────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐
│ OpenAI API   │  │ Gemini /    │  │ Edge (on device)    │
│ /v1/chat     │  │ OpenRouter  │  │ @tensorflow/tfjs    │
│ completions  │  │  (optional) │  │                     │
└──────────────┘  └─────────────┘  └─────────────────────┘
       │
       ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│ Supabase                 │     │ Expo                        │
│ • Email / password auth  │     │ • Document picker           │
│ • PostgreSQL `chats`     │     │ • Splash + status bar       │
│ • documents              │     │                             │
└──────────────────────────┘     └─────────────────────────────┘
```

**Request path**

1. The user sends a prompt from `ChatScreen`.
2. If **RAG** is on, `ragService` embeds the question, retrieves nearby chunks, and builds a context block.
3. If the device is **online**, `aiService` calls **OpenAI** (`https://api.openai.com/v1/chat/completions`) with your key. Gemini and OpenRouter remain optional.
4. If the device is **offline** (or On-device is selected), `onDeviceModel` runs local TensorFlow.js inference and returns an Edge reply.
5. The conversation is cached in Zustand / AsyncStorage and upserted into Supabase `chats`.

---

## Run the app (Expo)

Install [Expo Go](https://expo.dev/go) on your phone or use an Android emulator that already has Expo Go.

```bash
npm install
npx expo start
```

Then:

- press `a` to open the Android emulator, or
- scan the QR code with Expo Go on your phone.

If PowerShell blocks `npx`, use `npx.cmd expo start` or `npm.cmd start`.

You do **not** need Android Studio Gradle for this path. Guest mode works immediately. Put your OpenAI key in `.env`.

The previous bare React Native `android/` / `ios/` trees were moved to `legacy-native/` so Expo can run as a managed app.

Copy `.env.example` to `.env` and add your keys. Optional file-based fallback: copy `src/config/env.local.example.js` to `src/config/env.local.js`. A sample RAG file lives at `assets/sample-knowledge.md`.

---

## OpenAI API key (recommended)

1. Open [OpenAI API keys](https://platform.openai.com/api-keys).
2. Create a secret key (`sk-...`). Billing must be enabled on the project.
3. Put it in the project-root `.env` file:

   `EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key`

   `.env` is gitignored. Restart Expo after you change it (`npm.cmd start -- --clear`).
4. Pick a model in Settings: `gpt-4o-mini` (default), `gpt-4o`, `gpt-4.1-mini`, or `gpt-4.1`.

Chat uses `/v1/chat/completions`. RAG embeddings use `text-embedding-3-small`.

---

## Gemini API key

1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with a Google account and create an API key.
3. Enable the Generative Language API if the console asks you to.
4. Paste the key into `.env` as `EXPO_PUBLIC_GEMINI_API_KEY`.

Useful models in Settings: `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`. Embeddings use `text-embedding-004`.

---

## OpenRouter API key

1. Create an account at [OpenRouter](https://openrouter.ai/).
2. Open [Keys](https://openrouter.ai/keys) and generate a key.
3. Add credits or attach a provider key if your account requires it.
4. Paste the key into `.env` as `EXPO_PUBLIC_OPENROUTER_API_KEY`.
5. Optionally set `OPENROUTER_SITE_URL` and `OPENROUTER_APP_NAME` — OpenRouter uses those headers for attribution.

Aura calls `https://openrouter.ai/api/v1/chat/completions` with `fetch`. Switch models in Settings (`openai/gpt-4o-mini`, Claude, Llama, Gemini via OpenRouter).

---

## Supabase keys

You need two values: the **project URL** and the **anon public key**.

1. Open [supabase.com](https://supabase.com/) and sign in.
2. **New project** (or open an existing one). Wait until it finishes provisioning.
3. Open **Project Settings → API**.
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key (under Project API keys) → `EXPO_PUBLIC_SUPABASE_ANON_KEY`  
     Do **not** use the `service_role` key in the app.
5. Paste both into the project-root `.env` file.
6. **Authentication → Providers → Email** → enable Email.
7. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) so `chats` and `documents` exist.

Restart Expo after saving `.env`: `npm.cmd start -- --clear`.

Guest mode works without Supabase. Email sign-in and cloud chat history need these keys.

Never commit `.env`.

---

## Project map

```
App.js
src/
  config/env.js                 # Keys + model catalog
  services/aiService.js         # OpenAI + Gemini + OpenRouter
  services/onDeviceModel.js     # TFJS edge sentiment + local embeddings
  services/ragService.js        # Chunk, embed, retrieve, augment
  services/supabaseClient.js    # Auth + chats table
  store/useAppStore.js          # Zustand global state
  screens/                      # Home, Chat, Documents, Settings, Auth
  navigation/AppNavigator.js    # React Navigation tabs + auth stack
supabase/schema.sql
```

---

## Edge AI notes

`src/services/onDeviceModel.js` runs `@tensorflow/tfjs` on the JS CPU backend (Expo Go compatible). It scores sentiment with a small linear head (`matMul` + `softmax`) and falls back to the same weights in pure JavaScript if tensors fail.

---

## License

Private proof-of-work. Replace keys, never commit `src/config/env.local.js`.
