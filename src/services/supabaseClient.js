/**
 * Supabase client — email/password auth plus PostgreSQL chat history.
 *
 * Tables expected in the project (see supabase/schema.sql):
 *   - chats(id, user_id, title, model, provider, messages, created_at, updated_at)
 *   - documents(id, user_id, title, payload, created_at)
 *
 * Row Level Security restricts every row to auth.uid() = user_id.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {ENV, hasSupabaseConfig} from '../config/env';

let client = null;

export const isSupabaseConfigured = () => hasSupabaseConfig();

export const getSupabase = () => {
  if (!hasSupabaseConfig()) {
    return null;
  }
  if (!client) {
    client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
};

const requireClient = () => {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.',
    );
  }
  return supabase;
};

export async function signInWithEmail(email, password) {
  const {data, error} = await requireClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function signUpWithEmail(email, password) {
  const {data, error} = await requireClient().auth.signUp({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function signOutSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {error} = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  const supabase = getSupabase();
  if (!supabase) {
    return {session: null, user: null};
  }
  const {data, error} = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return {
    session: data.session,
    user: data.session?.user || null,
  };
}

export const subscribeToAuth = (callback) => {
  const supabase = getSupabase();
  if (!supabase) {
    return () => {};
  }
  const {data} = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
};

export async function fetchChats(userId) {
  const {data, error} = await requireClient()
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', {ascending: false});
  if (error) {
    throw error;
  }
  return data || [];
}

export async function upsertChat(userId, conversation) {
  const row = {
    id: conversation.id,
    user_id: userId,
    title: conversation.title,
    model: conversation.model || null,
    provider: conversation.provider || null,
    messages: conversation.messages || [],
    updated_at: new Date().toISOString(),
  };

  const {data, error} = await requireClient()
    .from('chats')
    .upsert(row, {onConflict: 'id'})
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteChat(userId, conversationId) {
  const {error} = await requireClient()
    .from('chats')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);
  if (error) {
    throw error;
  }
}

export async function upsertDocumentRow(userId, document) {
  const {data, error} = await requireClient()
    .from('documents')
    .upsert(
      {
        id: document.id,
        user_id: userId,
        title: document.title,
        payload: document,
      },
      {onConflict: 'id'},
    )
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export async function fetchDocuments(userId) {
  const {data, error} = await requireClient()
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});
  if (error) {
    throw error;
  }
  return (data || []).map((row) => row.payload).filter(Boolean);
}

export async function deleteDocumentRow(userId, documentId) {
  const {error} = await requireClient()
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', userId);
  if (error) {
    throw error;
  }
}

