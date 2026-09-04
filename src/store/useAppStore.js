/**
 * Global application state — auth, connectivity, settings, chats, and RAG docs.
 * Persists a subset of the store to AsyncStorage so a cold start feels instant.
 */

import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {createId} from '../utils/id';
import {titleFromPrompt} from '../utils/format';
import {generateChatResponse} from '../services/aiService';
import {
  analyzeSentiment,
  generateOfflineReply,
} from '../services/onDeviceModel';
import {
  buildRagQuery,
  pickAndIngestDocument,
} from '../services/ragService';
import {
  deleteChat,
  deleteDocumentRow,
  fetchChats,
  fetchDocuments,
  getCurrentSession,
  isSupabaseConfigured,
  signInWithEmail as supabaseSignIn,
  signInWithGoogleIdToken,
  signOutSupabase,
  signUpWithEmail as supabaseSignUp,
  subscribeToAuth,
  upsertChat,
  upsertDocumentRow,
} from '../services/supabaseClient';
import {
  configureGoogleSignIn,
  registerPushNotifications,
  signInWithGoogle,
  signOutGoogle,
  subscribeToForegroundMessages,
} from '../services/firebaseClient';

const STORAGE_KEY = 'aura-ai-store-v1';

const isCloudUser = (userId) =>
  Boolean(userId && userId !== 'local-guest' && isSupabaseConfigured());

const persistable = (state) => ({
  provider: state.provider,
  openaiModel: state.openaiModel,
  geminiModel: state.geminiModel,
  openrouterModel: state.openrouterModel,
  notificationsEnabled: state.notificationsEnabled,
  conversations: state.conversations,
  documents: state.documents,
  currentConversationId: state.currentConversationId,
  isGuest: Boolean(state.user?.id === 'local-guest'),
});

const loadPersisted = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const savePersisted = async (state) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable(state)));
};

const mapRemoteChat = (row) => ({
  id: row.id,
  title: row.title,
  model: row.model,
  provider: row.provider,
  messages: row.messages || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const useAppStore = create((set, get) => ({
  hydrated: false,
  user: null,
  session: null,
  authLoading: false,
  isOnline: true,
  globalLoading: false,
  globalError: null,
  notice: null,

  provider: 'openai',
  openaiModel: 'gpt-4o-mini',
  geminiModel: 'gemini-2.0-flash',
  openrouterModel: 'openai/gpt-4o-mini',
  notificationsEnabled: true,

  conversations: [],
  currentConversationId: null,
  chatLoading: false,
  documents: [],
  ragLoading: false,
  lastSentiment: null,
  lastNotification: null,

  setNotice: (notice) => set({notice}),
  setGlobalError: (globalError) => set({globalError}),
  setProvider: (provider) => {
    set({provider});
    savePersisted(get());
  },
  setOpenAiModel: (openaiModel) => {
    set({openaiModel});
    savePersisted(get());
  },
  setGeminiModel: (geminiModel) => {
    set({geminiModel});
    savePersisted(get());
  },
  setOpenrouterModel: (openrouterModel) => {
    set({openrouterModel});
    savePersisted(get());
  },
  setNotificationsEnabled: (notificationsEnabled) =>
    set({notificationsEnabled}),

  hydrate: async () => {
    const cached = await loadPersisted();
    const guestUser = cached.isGuest
      ? {
          id: 'local-guest',
          email: 'guest@aura.local',
          user_metadata: {full_name: 'Guest'},
        }
      : null;
    set({
      ...cached,
      openaiModel: cached.openaiModel || 'gpt-4o-mini',
      provider: cached.provider || 'openai',
      user: guestUser,
      hydrated: true,
    });

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      set({isOnline: Boolean(state.isConnected && state.isInternetReachable !== false)});
    });

    configureGoogleSignIn();

    let unsubscribeAuth = () => {};
    if (isSupabaseConfigured()) {
      try {
        const {session, user} = await getCurrentSession();
        if (user) {
          set({session, user});
          await get().syncCloudData(user.id);
          if (get().notificationsEnabled) {
            registerPushNotifications(user.id);
          }
        }
      } catch (error) {
        set({globalError: error.message});
      }
      unsubscribeAuth = subscribeToAuth((session) => {
        if (session?.user) {
          set({session, user: session.user});
        }
      });
    }

    const unsubscribePush = subscribeToForegroundMessages((remoteMessage) => {
      set({
        lastNotification: {
          title: remoteMessage?.notification?.title || 'Aura AI',
          body: remoteMessage?.notification?.body || 'Background AI job update',
          data: remoteMessage?.data || {},
          receivedAt: new Date().toISOString(),
        },
        notice: remoteMessage?.notification?.body || 'Background AI job update',
      });
    });

    return () => {
      unsubscribeNet();
      unsubscribeAuth();
      unsubscribePush();
    };
  },

  syncCloudData: async (userId) => {
    if (!isCloudUser(userId)) {
      return;
    }
    try {
      const [chats, documents] = await Promise.all([
        fetchChats(userId),
        fetchDocuments(userId).catch(() => []),
      ]);
      set({
        conversations: chats.map(mapRemoteChat),
        documents: documents.length ? documents : get().documents,
      });
      savePersisted(get());
    } catch (error) {
      set({globalError: error.message});
    }
  },

  signInWithEmail: async (email, password) => {
    set({authLoading: true, globalError: null});
    try {
      const {session, user} = await supabaseSignIn(email.trim(), password);
      set({session, user, authLoading: false});
      if (user) {
        await get().syncCloudData(user.id);
        registerPushNotifications(user.id);
      }
    } catch (error) {
      set({authLoading: false, globalError: error.message});
      throw error;
    }
  },

  signUpWithEmail: async (email, password) => {
    set({authLoading: true, globalError: null});
    try {
      const {session, user} = await supabaseSignUp(email.trim(), password);
      set({session, user, authLoading: false});
      if (!session) {
        set({
          notice:
            'Account created. Confirm your email in Supabase if confirmation is enabled, then sign in.',
        });
      }
    } catch (error) {
      set({authLoading: false, globalError: error.message});
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({authLoading: true, globalError: null});
    try {
      const google = await signInWithGoogle();
      let session = null;
      let user = google.user
        ? {
            id: google.user.id,
            email: google.user.email,
            user_metadata: {
              full_name: google.user.name,
              avatar_url: google.user.photo,
            },
          }
        : null;

      if (isSupabaseConfigured() && google.idToken) {
        const synced = await signInWithGoogleIdToken(
          google.idToken,
          google.accessToken,
        );
        session = synced.session;
        user = synced.user;
      }

      set({session, user, authLoading: false});
      if (user?.id) {
        await get().syncCloudData(user.id);
        registerPushNotifications(user.id);
      }
    } catch (error) {
      set({authLoading: false, globalError: error.message});
      throw error;
    }
  },

  continueAsGuest: () => {
    set({
      user: {
        id: 'local-guest',
        email: 'guest@aura.local',
        user_metadata: {full_name: 'Guest'},
      },
      session: null,
      globalError: null,
      notice: 'Guest mode — chats stay on this device until you connect Supabase.',
    });
    savePersisted(get());
  },

  signOut: async () => {
    await signOutGoogle();
    try {
      await signOutSupabase();
    } catch {
      // Local sign-out should still succeed if the network is down.
    }
    set({user: null, session: null});
    savePersisted(get());
  },

  createConversation: (seedTitle) => {
    const conversation = {
      id: createId('chat'),
      title: seedTitle || 'New conversation',
      messages: [],
      provider: get().provider,
      model: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({
      conversations: [conversation, ...get().conversations],
      currentConversationId: conversation.id,
    });
    savePersisted(get());
    return conversation.id;
  },

  openConversation: (conversationId) =>
    set({currentConversationId: conversationId}),

  deleteConversation: async (conversationId) => {
    const next = get().conversations.filter((item) => item.id !== conversationId);
    set({
      conversations: next,
      currentConversationId:
        get().currentConversationId === conversationId
          ? next[0]?.id || null
          : get().currentConversationId,
    });
    savePersisted(get());
    const userId = get().user?.id;
    if (isCloudUser(userId)) {
      try {
        await deleteChat(userId, conversationId);
      } catch (error) {
        set({globalError: error.message});
      }
    }
  },

  persistConversation: async (conversation) => {
    const userId = get().user?.id;
    if (isCloudUser(userId)) {
      try {
        await upsertChat(userId, conversation);
      } catch (error) {
        set({globalError: error.message});
      }
    }
  },

  sendMessage: async (rawText, {useRag = false} = {}) => {
    const content = String(rawText || '').trim();
    if (!content) {
      return;
    }

    let conversationId = get().currentConversationId;
    if (!conversationId) {
      conversationId = get().createConversation(titleFromPrompt(content));
    }

    const userMessage = {
      id: createId('msg'),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const conversations = get().conversations.map((item) =>
      item.id === conversationId
        ? {
            ...item,
            title:
              item.messages.length === 0
                ? titleFromPrompt(content)
                : item.title,
            messages: [...item.messages, userMessage],
            updatedAt: new Date().toISOString(),
          }
        : item,
    );

    set({conversations, chatLoading: true, globalError: null});

    const conversation = conversations.find((item) => item.id === conversationId);
    const history = conversation.messages.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    try {
      let ragContext = '';
      let citations = [];
      if (useRag && get().documents.length) {
        const rag = await buildRagQuery(
          content,
          get().documents,
          get().isOnline,
        );
        ragContext = rag.context;
        citations = rag.matches;
        set({lastSentiment: rag.sentiment});
      }

      const result =
        get().isOnline && get().provider !== 'on-device'
          ? await generateChatResponse({
              messages: history,
              provider: get().provider,
              openaiModel: get().openaiModel,
              geminiModel: get().geminiModel,
              openrouterModel: get().openrouterModel,
              ragContext,
            })
          : await generateOfflineReply(content);

      const assistantMessage = {
        id: createId('msg'),
        role: 'assistant',
        content: result.content,
        provider: result.provider,
        model: result.model,
        citations,
        createdAt: new Date().toISOString(),
      };

      const nextConversations = get().conversations.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              provider: result.provider,
              model: result.model,
              messages: [...item.messages, assistantMessage],
              updatedAt: new Date().toISOString(),
            }
          : item,
      );

      set({conversations: nextConversations, chatLoading: false});
      savePersisted(get());
      const updated = nextConversations.find((item) => item.id === conversationId);
      await get().persistConversation(updated);

      if (get().notificationsEnabled && !get().isOnline) {
        set({
          lastNotification: {
            title: 'Edge AI reply ready',
            body: 'Aura answered on-device because you are offline.',
            receivedAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      const failed = {
        id: createId('msg'),
        role: 'assistant',
        content: error.message,
        error: true,
        createdAt: new Date().toISOString(),
      };
      set({
        chatLoading: false,
        globalError: error.message,
        conversations: get().conversations.map((item) =>
          item.id === conversationId
            ? {...item, messages: [...item.messages, failed]}
            : item,
        ),
      });
    }
  },

  analyzeLocalSentiment: async (text) => {
    const sentiment = await analyzeSentiment(text);
    set({lastSentiment: sentiment});
    return sentiment;
  },

  ingestPickedDocument: async () => {
    set({ragLoading: true, globalError: null});
    try {
      const document = await pickAndIngestDocument(get().isOnline);
      const documents = [document, ...get().documents];
      set({documents, ragLoading: false, notice: `Indexed ${document.title}`});
      savePersisted(get());
      const userId = get().user?.id;
      if (isCloudUser(userId)) {
        await upsertDocumentRow(userId, document);
      }
      return document;
    } catch (error) {
      if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
        set({ragLoading: false});
        return null;
      }
      set({ragLoading: false, globalError: error.message});
      throw error;
    }
  },

  removeDocument: async (documentId) => {
    set({
      documents: get().documents.filter((item) => item.id !== documentId),
    });
    savePersisted(get());
    const userId = get().user?.id;
    if (isCloudUser(userId)) {
      try {
        await deleteDocumentRow(userId, documentId);
      } catch (error) {
        set({globalError: error.message});
      }
    }
  },

  askWithRag: async (question) => {
    if (!get().currentConversationId) {
      get().createConversation(titleFromPrompt(question));
    }
    return get().sendMessage(question, {useRag: true});
  },
}));
