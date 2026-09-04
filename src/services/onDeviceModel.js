/**
 * On-device / Edge AI.
 *
 * Demonstrates local inference that keeps working with no network:
 *   1. TensorFlow.js tensors (`@tensorflow/tfjs`), optionally adapted by
 *      `@tensorflow/tfjs-react-native` when that native backend is available.
 *   2. Optional TFLite runtime (`react-native-fast-tflite`) if a `.tflite`
 *      asset is bundled later.
 *   3. A compact, always-available lexicon + linear model so sentiment
 *      analysis never depends on a native binary being present.
 *
 * The public API is intentionally small so Chat / Home can call it the same
 * way they call the cloud providers.
 */

const FEATURE_SIZE = 16;

/**
 * Compact bag-of-words weights inspired by a pretrained linear sentiment head.
 * Each row is a class: [negative, neutral, positive].
 */
const CLASS_WEIGHTS = [
  [
    1.35, 1.1, 0.15, 0.55, -1.25, 0.85, 0.4, 0.25, 0.7, -0.35, 0.2, 0.9, 0.15,
    0.45, -0.25, 0.1,
  ],
  [
    -0.2, -0.15, 0.9, -0.05, 0.1, -0.2, 0.05, 0.35, -0.15, 0.55, 0.4, -0.25,
    0.3, -0.1, 0.2, 0.15,
  ],
  [
    -1.2, -0.95, 0.05, -0.4, 1.4, -0.7, -0.25, 0.15, -0.55, 0.2, -0.1, -0.75,
    0.05, -0.35, 0.35, 0.05,
  ],
];

const CLASS_BIAS = [0.05, 0.18, -0.04];
const CLASS_LABELS = ['negative', 'neutral', 'positive'];

const LEXICONS = {
  positive: [
    'good',
    'great',
    'excellent',
    'amazing',
    'love',
    'wonderful',
    'happy',
    'fantastic',
    'awesome',
    'beautiful',
    'best',
    'enjoy',
    'perfect',
    'brilliant',
    'thanks',
    'grateful',
    'success',
    'win',
    'helpful',
    'delight',
  ],
  negative: [
    'bad',
    'terrible',
    'awful',
    'hate',
    'worst',
    'sad',
    'angry',
    'horrible',
    'poor',
    'fail',
    'broken',
    'bug',
    'crash',
    'slow',
    'problem',
    'issue',
    'error',
    'frustrating',
    'disappointed',
    'useless',
  ],
  intensifiers: ['very', 'really', 'so', 'extremely', 'incredibly', 'super'],
  negations: ['not', "n't", 'never', 'no', 'hardly', 'without'],
};

let tfModule = null;
let tfReadyPromise = null;
let tflitePlugin = null;

const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/**
 * Hand-crafted 16-d feature vector. Cheap enough for a phone CPU and stable
 * enough to drive the linear classifier below.
 */
export const extractSentimentFeatures = (text) => {
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);
  let positive = 0;
  let negative = 0;
  let intensifier = 0;
  let negation = 0;

  tokens.forEach((token, index) => {
    if (LEXICONS.positive.includes(token)) {
      positive += 1;
    }
    if (LEXICONS.negative.includes(token)) {
      negative += 1;
    }
    if (LEXICONS.intensifiers.includes(token)) {
      intensifier += 1;
    }
    if (LEXICONS.negations.includes(token)) {
      negation += 1;
    }
    if (
      index > 0 &&
      LEXICONS.negations.includes(tokens[index - 1]) &&
      LEXICONS.positive.includes(token)
    ) {
      positive -= 1.4;
      negative += 0.7;
    }
  });

  const length = Math.max(tokens.length, 1);
  return [
    negative / length,
    Math.min(negative, 5) / 5,
    Math.min(length / 40, 1),
    (tokens.filter((token) => token.includes('!')).length ? 1 : 0) * 0.2,
    positive / length,
    Math.min(positive, 5) / 5,
    intensifier / length,
    negation / length,
    Math.min(text.replace(/[^.!?]/g, '').length / 4, 1),
    tokenSet.size / length,
    Math.min(text.length / 280, 1),
    Number(negative > positive),
    Number(positive > negative),
    Number(/\b(please|help|how|why|what)\b/i.test(text)),
    Number(/\b(love|great|thanks)\b/i.test(text)),
    Number(/\b(hate|bug|crash|error)\b/i.test(text)),
  ];
};

const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
};

const matVec = (matrix, vector) =>
  matrix.map(
    (row, rowIndex) =>
      row.reduce((sum, weight, index) => sum + weight * vector[index], 0) +
      CLASS_BIAS[rowIndex],
  );

const toPrediction = (probabilities, engine) => {
  let bestIndex = 0;
  probabilities.forEach((value, index) => {
    if (value > probabilities[bestIndex]) {
      bestIndex = index;
    }
  });

  return {
    label: CLASS_LABELS[bestIndex],
    confidence: Number(probabilities[bestIndex].toFixed(3)),
    scores: {
      negative: Number(probabilities[0].toFixed(3)),
      neutral: Number(probabilities[1].toFixed(3)),
      positive: Number(probabilities[2].toFixed(3)),
    },
    engine,
    offline: true,
  };
};

/**
 * Load TensorFlow.js on the JS CPU backend (Expo Go compatible).
 */
export async function initOnDeviceRuntime() {
  if (tfModule) {
    return tfModule;
  }
  if (tfReadyPromise) {
    return tfReadyPromise;
  }

  tfReadyPromise = (async () => {
    const tf = require('@tensorflow/tfjs');
    await tf.ready();
    tfModule = tf;
    return tf;
  })();

  return tfReadyPromise;
}

async function inferWithTfjs(features) {
  const tf = await initOnDeviceRuntime();
  const x = tf.tensor2d([features], [1, FEATURE_SIZE]);
  const w = tf.tensor2d(CLASS_WEIGHTS);
  const b = tf.tensor1d(CLASS_BIAS);
  const logits = x.matMul(w.transpose()).add(b);
  const probs = tf.softmax(logits);
  const values = Array.from(await probs.data());
  tf.dispose([x, w, b, logits, probs]);
  return toPrediction(values, 'tfjs');
}

async function inferWithTflite(features) {
  if (!tflitePlugin) {
    try {
      // eslint-disable-next-line global-require
      tflitePlugin = require('react-native-fast-tflite');
    } catch {
      return null;
    }
  }

  // A bundled `.tflite` asset is optional. When absent we keep TFJS / JS.
  if (!tflitePlugin.loadTensorflowModel) {
    return null;
  }
  return null;
}

function inferWithLinearModel(features) {
  return toPrediction(softmax(matVec(CLASS_WEIGHTS, features)), 'linear-js');
}

/**
 * Run on-device sentiment analysis against arbitrary user text.
 */
export async function analyzeSentiment(text) {
  const features = extractSentimentFeatures(text);

  try {
    return await inferWithTfjs(features);
  } catch {
    // Native TFJS adapter can fail on a fresh project; JS inference still runs.
  }

  try {
    const tflite = await inferWithTflite(features);
    if (tflite) {
      return tflite;
    }
  } catch {
    // Optional TFLite path.
  }

  return inferWithLinearModel(features);
}

/**
 * Lightweight local embedding used by RAG when Gemini embeddings are offline.
 * Deterministic hashing + n-grams — not as strong as a transformer, but it
 * runs entirely on device and is good enough for small personal documents.
 */
export const embedLocally = (text, dimensions = 64) => {
  const tokens = tokenize(text);
  const vector = new Array(dimensions).fill(0);

  tokens.forEach((token, index) => {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const slot = Math.abs(hash) % dimensions;
    vector[slot] += 1;
    vector[(slot + token.length) % dimensions] += 0.35;
    vector[(slot + index) % dimensions] += 0.15;
  });

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
};

export const cosineSimilarity = (a, b) => {
  if (!a?.length || !b?.length || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom ? dot / denom : 0;
};

/**
 * Template-based offline assistant used when the device has no internet.
 * Sentiment from the local model shapes the tone of the reply.
 */
export async function generateOfflineReply(prompt) {
  const sentiment = await analyzeSentiment(prompt);
  const tone =
    sentiment.label === 'negative'
      ? 'I can hear that this is frustrating.'
      : sentiment.label === 'positive'
        ? 'Glad this sounds like it is going well.'
        : 'I can help with a first-pass answer on device.';

  const content = `${tone} Aura is running in Edge AI mode (no cloud). Local sentiment: ${sentiment.label} (${Math.round(
    sentiment.confidence * 100,
  )}% via ${sentiment.engine}).

You asked: “${String(prompt).trim()}”

I can classify tone, retrieve from documents you already uploaded, and keep chatting locally. Reconnect to use Gemini or OpenRouter for a full generative answer.`;

  return {
    content,
    provider: 'on-device',
    model: `edge-sentiment-${sentiment.engine}`,
    sentiment,
  };
}
