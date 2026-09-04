# Aura AI product brief

Aura AI Mobile is a proof-of-work assistant that combines cloud generation, on-device inference, and retrieval-augmented generation.

## Authentication

Users sign in with email and password through Supabase. Chat history is stored in the PostgreSQL `chats` table and protected by row-level security. Guest mode keeps chats on the device only.

## Models

- OpenAI is the default cloud model.
- Gemini and OpenRouter are optional fallbacks.
- When the device is offline, Aura runs a TensorFlow.js sentiment classifier locally.

## RAG

Upload a text document. Aura chunks the file, embeds each slice, and retrieves the closest matches before answering a question.
