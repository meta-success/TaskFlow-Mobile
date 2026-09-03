# Aura AI product brief

Aura AI Mobile is a proof-of-work assistant that combines cloud generation, on-device inference, and retrieval-augmented generation.

## Authentication

Users can sign in with email and password through Supabase, or with Google through Firebase. Chat history is stored in the PostgreSQL `chats` table and protected by row-level security.

## Models

- Gemini 2.0 Flash is the default cloud model.
- OpenRouter exposes GPT-4o Mini, Claude 3.5 Sonnet, and Llama 3.1 70B.
- When the device is offline, Aura runs a TensorFlow.js sentiment classifier locally.

## RAG

Upload a text document. Aura chunks the file, embeds each slice, and retrieves the closest matches before answering a question.

## Notifications

Firebase Cloud Messaging can notify the phone when a background AI job completes.
