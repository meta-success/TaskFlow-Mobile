# Aura AI Mobile

Professional proof-of-work for a React Native Android app that combines **cloud generative AI**, **on-device inference**, **RAG**, and **Supabase + Firebase** identity.

Aura is a dark, production-styled assistant. The default cloud path is **your OpenAI API key**. Gemini and OpenRouter stay available as optional fallbacks, and a TensorFlow.js model answers on-device when you are offline.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Aura AI Mobile                           │
│                     (React Native 0.76 + Hermes)                 │
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
│  OpenAI fetch    TFJS / linear        chunk → embed              │
│  Gemini /        sentiment +          retrieve top-k             │
│  OpenRouter      local embeddings     augment prompt             │
└──────┬─────────────────┬─────────────────┬───────────────────────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐
│ OpenAI API   │  │ Gemini /    │  │ Edge (on device)    │
│ /v1/chat     │  │ OpenRouter  │  │ @tensorflow/tfjs    │
│ completions  │  │  (optional) │  │ tfjs-react-native   │
└──────────────┘  └─────────────┘  └─────────────────────┘
       │
       ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│ Supabase                 │     │ Firebase                    │
│ • Email / password auth  │     │ • Google Sign-In (OAuth)    │
│ • PostgreSQL `chats`     │     │ • FCM push for AI jobs      │
│ • documents + tokens     │     │ • google-services.json      │
└──────────────────────────┘     └─────────────────────────────┘
```

**Request path**

1. The user sends a prompt from `ChatScreen`.
2. If **RAG** is on, `ragService` embeds the question, retrieves nearby chunks, and builds a context block.
3. If the device is **online**, `aiService` calls **OpenAI** (`https://api.openai.com/v1/chat/completions`) with your key. Gemini and OpenRouter remain optional.
4. If the device is **offline** (or On-device is selected), `onDeviceModel` runs local TensorFlow.js inference and returns an Edge reply.
5. The conversation is cached in Zustand / AsyncStorage and upserted into Supabase `chats`.
6. Firebase Cloud Messaging can notify the device when a longer background AI job finishes.

---

## Run the app

Prerequisites: Node 18+, JDK 17, Android Studio with an emulator or USB device, and Android SDK 35.

```bash
npm install
npx react-native start
npx react-native run-android
```

Or in one step after Metro is already running:

```bash
npm run android
```

Copy `src/config/env.local.example.js` to `src/config/env.local.js` and fill in keys before using cloud features. You can tap **Continue as guest** to explore the UI and on-device model without any keys. A sample RAG file lives at `assets/sample-knowledge.md` — copy it to the device and upload it from the Knowledge tab.

---

## OpenAI API key (recommended)

1. Open [OpenAI API keys](https://platform.openai.com/api-keys).
2. Create a secret key (`sk-...`). Billing must be enabled on the project.
3. In the app: **Settings → OpenAI API key**, paste it, and tap **Save**.  
   Or put it in `src/config/env.local.js` as `OPENAI_API_KEY`.
4. Pick a model in Settings: `gpt-4o-mini` (default), `gpt-4o`, `gpt-4.1-mini`, or `gpt-4.1`.

Chat uses `/v1/chat/completions`. RAG embeddings use `text-embedding-3-small`.

---

## Gemini API key

1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with a Google account and create an API key.
3. Enable the Generative Language API if the console asks you to.
4. Paste the key into `src/config/env.local.js` as `GEMINI_API_KEY`.

Useful models in Settings: `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`. Embeddings use `text-embedding-004`.

---

## OpenRouter API key

1. Create an account at [OpenRouter](https://openrouter.ai/).
2. Open [Keys](https://openrouter.ai/keys) and generate a key.
3. Add credits or attach a provider key if your account requires it.
4. Paste the key into `src/config/env.local.js` as `OPENROUTER_API_KEY`.
5. Optionally set `OPENROUTER_SITE_URL` and `OPENROUTER_APP_NAME` — OpenRouter uses those headers for attribution.

Aura calls `https://openrouter.ai/api/v1/chat/completions` with `fetch`. Switch models in Settings (`openai/gpt-4o-mini`, Claude, Llama, Gemini via OpenRouter).

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com/).
2. In **Project Settings → API**, copy the Project URL and the `anon` public key.
3. Put them in `src/config/env.local.js` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
4. Open **Authentication → Providers** and enable **Email**.
5. Enable **Google** if you want the Firebase Google token to create a Supabase session (`signInWithIdToken`).
6. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). That creates:

   - `chats` — conversation history (`messages` JSONB)
   - `documents` — RAG payloads
   - `device_tokens` — FCM tokens for AI-job notifications
   - Row Level Security so a user only reads their own rows

Email/password sign-in and Google (via ID token) both persist chat history to `chats`.

---

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Add an **Android** app with package name `com.auraaimobile`.
3. Download `google-services.json` and place it at `android/app/google-services.json`.
   The Gradle plugin is applied automatically only when this file exists.
4. Enable **Authentication → Google**.
5. In Google Cloud Console (the same project), create an OAuth **Web client**.
   Copy that client ID into `GOOGLE_WEB_CLIENT_ID`.
6. Add your debug SHA-1 so Android Google Sign-In is accepted:

   ```bash
   cd android
   ./gradlew signingReport
   ```

7. Enable **Cloud Messaging**. A worker or Cloud Function can send a data payload
   `{ "type": "ai_complete", "conversationId": "..." }` when a background generation finishes.
   The app registers the FCM token into Supabase `device_tokens` and listens in the foreground.

Example `google-services.json` shape: `android/app/google-services.json.example`.

---

## Project map

```
App.js
src/
  config/env.js                 # Keys + model catalog
  services/aiService.js         # Gemini SDK + OpenRouter fetch
  services/onDeviceModel.js     # TFJS / edge sentiment + local embeddings
  services/ragService.js        # Chunk, embed, retrieve, augment
  services/supabaseClient.js    # Auth + chats table
  services/firebaseClient.js    # Google Sign-In + FCM
  store/useAppStore.js          # Zustand global state
  screens/                      # Home, Chat, Documents, Settings, Auth
  navigation/AppNavigator.js    # React Navigation tabs + auth stack
android/                        # Standard RN Gradle project
supabase/schema.sql
```

---

## Edge AI notes

`src/services/onDeviceModel.js` initializes `@tensorflow/tfjs` and, when linked, `@tensorflow/tfjs-react-native`. It then runs a small 16-feature linear head with tensor ops (`matMul` + `softmax`) for sentiment. If the native adapter is missing, the same weights run in pure JavaScript so offline chat never hard-crashes.

To swap in a real `.tflite` classifier later, drop the file under `android/app/src/main/assets/` and load it with `react-native-fast-tflite` — the service already has a guarded hook for that runtime.

---

## License

Private proof-of-work. Replace keys, never commit `src/config/env.local.js` or `google-services.json`.
