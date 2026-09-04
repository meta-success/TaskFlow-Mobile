/**
 * Expo auth and push notifications.
 *
 * Google Sign-In uses `expo-auth-session` (works in Expo Go).
 * Push uses `expo-notifications` instead of Firebase Messaging.
 * Tokens can still be stored in Supabase `device_tokens`.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform} from 'react-native';
import {ENV, hasGoogleSignInConfig} from '../config/env';
import {saveDeviceToken} from './supabaseClient';

WebBrowser.maybeCompleteAuthSession();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const configureGoogleSignIn = () => {
  WebBrowser.maybeCompleteAuthSession();
  return hasGoogleSignInConfig();
};

export async function signInWithGoogle() {
  if (!hasGoogleSignInConfig()) {
    throw new Error(
      'Google Sign-In is not configured. Add GOOGLE_WEB_CLIENT_ID from Google Cloud / Firebase.',
    );
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'auraai',
  });

  const request = new AuthSession.AuthRequest({
    clientId: ENV.GOOGLE_WEB_CLIENT_ID,
    responseType: AuthSession.ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    extraParams: {
      nonce: `${Date.now()}`,
    },
  });

  const result = await request.promptAsync(googleDiscovery);
  if (result.type !== 'success') {
    throw new Error('Google Sign-In was cancelled.');
  }

  const idToken = result.params.id_token;
  if (!idToken) {
    throw new Error('Google did not return an ID token.');
  }

  let email = '';
  let name = '';
  let picture = '';
  try {
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    email = payload.email || '';
    name = payload.name || '';
    picture = payload.picture || '';
  } catch {
    // Token still works for Supabase even if we cannot decode the profile.
  }

  return {
    user: {
      id: email || 'google-user',
      email,
      name,
      photo: picture,
    },
    idToken,
    accessToken: result.params.access_token,
  };
}

export async function signOutGoogle() {
  try {
    await WebBrowser.coolDownAsync();
  } catch {
    // Expo Go may not need a browser cooldown.
  }
}

export async function registerPushNotifications(userId) {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('aura-ai', {
        name: 'Aura AI',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;
    if (userId && token) {
      try {
        await saveDeviceToken(userId, token);
      } catch {
        // Token persistence is best-effort.
      }
    }
    return token;
  } catch {
    return null;
  }
}

export const subscribeToForegroundMessages = (handler) => {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    handler({
      notification: {
        title: notification.request.content.title,
        body: notification.request.content.body,
      },
      data: notification.request.content.data || {},
    });
  });
  return () => sub.remove();
};

export const describeAiJobNotification = (job) => ({
  title: job?.title || 'Aura finished processing',
  body:
    job?.body ||
    'A background AI job completed. Open the chat to review the result.',
  data: {
    type: 'ai_complete',
    conversationId: job?.conversationId || '',
  },
});
