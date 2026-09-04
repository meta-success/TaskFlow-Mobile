/**
 * Retrieval-Augmented Generation (RAG).
 *
 * Flow:
 *   1. User uploads a text document (picker + file read).
 *   2. Text is split into overlapping chunks.
 *   3. Each chunk is embedded — OpenAI `text-embedding-3-small` when online,
 *      then Gemini, otherwise the on-device hashing encoder.
 *   4. Vectors live in Zustand / AsyncStorage (and optionally Supabase).
 *   5. A question is embedded the same way, top-k chunks are retrieved,
 *      and the cloud (or edge) model answers with that context.
 */

import {Platform} from 'react-native';
import {embedWithGemini, embedWithOpenAI} from './aiService';
import {analyzeSentiment, cosineSimilarity, embedLocally} from './onDeviceModel';
import {createId} from '../utils/id';

const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 120;
const TOP_K = 4;

export const chunkText = (raw, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const text = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!text) {
    return [];
  }

  const chunks = [];
  let cursor = 0;
  while (cursor < text.length) {
    const end = Math.min(cursor + size, text.length);
    const slice = text.slice(cursor, end).trim();
    if (slice) {
      chunks.push(slice);
    }
    if (end >= text.length) {
      break;
    }
    cursor = end - overlap;
  }
  return chunks;
};

export async function embedText(text, isOnline = true) {
  if (isOnline) {
    try {
      const openai = await embedWithOpenAI(text);
      if (openai?.length) {
        return {vector: openai, source: 'openai-text-embedding-3-small'};
      }
    } catch {
      // Try Gemini, then the local encoder.
    }
    try {
      const remote = await embedWithGemini(text);
      if (remote?.length) {
        return {vector: remote, source: 'gemini-embedding-004'};
      }
    } catch {
      // Fall through to the local encoder so ingest still succeeds offline.
    }
  }
  return {vector: embedLocally(text), source: 'local-hash'};
}

export const retrieveChunks = (questionVector, documents, topK = TOP_K) => {
  const scored = [];

  documents.forEach((doc) => {
    (doc.chunks || []).forEach((chunk) => {
      scored.push({
        documentId: doc.id,
        title: doc.title,
        content: chunk.content,
        score: cosineSimilarity(questionVector, chunk.vector),
        embeddingSource: chunk.source,
      });
    });
  });

  return scored
    .filter((item) => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

export const formatRagContext = (matches) => {
  if (!matches.length) {
    return '';
  }
  return matches
    .map(
      (item, index) =>
        `[#${index + 1} ${item.title} | score ${item.score.toFixed(3)}]\n${item.content}`,
    )
    .join('\n\n');
};

export async function ingestDocument({title, text, isOnline}) {
  const chunks = chunkText(text);
  if (!chunks.length) {
    throw new Error('That file did not contain readable text.');
  }

  const embeddedChunks = [];
  for (const content of chunks) {
    const {vector, source} = await embedText(content, isOnline);
    embeddedChunks.push({
      id: createId('chunk'),
      content,
      vector,
      source,
    });
  }

  return {
    id: createId('doc'),
    title: title || 'Untitled document',
    createdAt: new Date().toISOString(),
    chunkCount: embeddedChunks.length,
    chunks: embeddedChunks,
  };
}

/**
 * Read a user-selected file. DocumentPicker returns a content URI on Android
 * that `fetch` can open inside React Native.
 */
export async function readPickedFile(file) {
  const uri = file.fileCopyUri || file.uri;
  if (!uri) {
    throw new Error('The selected file did not include a readable URI.');
  }

  const response = await fetch(uri);
  const text = await response.text();
  if (!text?.trim()) {
    throw new Error('Could not read text from that file.');
  }

  const fallbackName =
    file.name ||
    (Platform.OS === 'android' ? 'Uploaded document' : 'Document');

  return {title: fallbackName, text};
}

export async function pickAndIngestDocument(isOnline) {
  const DocumentPicker = require('expo-document-picker');
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/plain', 'text/markdown', 'application/json', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    const error = new Error('Document picker cancelled');
    error.code = 'DOCUMENT_PICKER_CANCELED';
    throw error;
  }

  const file = result.assets?.[0];
  if (!file?.uri) {
    throw new Error('The selected file did not include a readable URI.');
  }

  const {title, text} = await readPickedFile({
    uri: file.uri,
    name: file.name,
  });
  return ingestDocument({title, text, isOnline});
}

export async function buildRagQuery(question, documents, isOnline) {
  const {vector, source} = await embedText(question, isOnline);
  const matches = retrieveChunks(vector, documents);
  const sentiment = await analyzeSentiment(question);

  return {
    embeddingSource: source,
    matches,
    context: formatRagContext(matches),
    sentiment,
  };
}
