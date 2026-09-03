/**
 * Firebase client — Google Sign-In and FCM push notifications.
 *
 * Google authentication is performed with `@react-native-google-signin/google-signin`
 * (configured through Firebase / Google Cloud OAuth clients). The resulting
 * ID token is handed to Supabase so chat history stays in one user store.
 *
 * Push notifications use `@react-native-firebase/messaging` so a Cloud Function
 * or backend worker can tell the device when a long-running AI job finishes.
 */

import {Platform, PermissionsAndroid} from 'react-native';
import {ENV, hasGoogleSignInConfig} from '../config/env';
import {saveDeviceToken} from './supabaseClient';

let messagingModule = null;
let googleModule = null;

const loadGoogle = () => {
  if (!googleModule) {
    // eslint-disable-next-line global-require
    googleModule = require('@react-native-google-signin/google-signin');
  }
  return googleModule;
};

const loadMessaging = () => {
  if (!messagingModule) {
    // eslint-disable-next-line global-require
    messagingModule = require('@react-native-firebase/messaging').default;
  }
  return messagingModule;
};

export const configureGoogleSignIn = () => {
  if (!hasGoogleSignInConfig()) {
    return false;
  }
  const {GoogleSignin} = loadGoogle();
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID || undefined,
    offlineAccess: true,
    scopes: ['profile', 'email'],
  });
  return true;
};

export async function signInWithGoogle() {
  if (!hasGoogleSignInConfig()) {
    throw new Error(
      'Google Sign-In is not configured. Add GOOGLE_WEB_CLIENT_ID from Firebase Authentication.',
    );
  }

  configureGoogleSignIn();
  const {GoogleSignin, statusCodes} = loadGoogle();

  try {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const response = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    const user = response?.data?.user || response?.user || null;

    return {
      user,
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
    };
  } catch (error) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Google Sign-In was cancelled.');
    }
    if (error?.code === statusCodes.IN_PROGRESS) {
      throw new Error('Google Sign-In is already in progress.');
    }
    if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services is not available on this device.');
    }
    throw error;
  }
}

export async function signOutGoogle() {
  try {
    const {GoogleSignin} = loadGoogle();
    const current = await GoogleSignin.getCurrentUser();
    if (current) {
      await GoogleSignin.signOut();
    }
  } catch {
    // Google session may not exist when the user signed in with email.
  }
}

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * Register for FCM and persist the token so a backend worker can target
 * this device when background AI processing completes.
 */
export async function registerPushNotifications(userId) {
  try {
    const permitted = await requestAndroidNotificationPermission();
    if (!permitted) {
      return null;
    }

    const messaging = loadMessaging();
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      return null;
    }

    const token = await messaging().getToken();
    if (userId && token) {
      try {
        await saveDeviceToken(userId, token);
      } catch {
        // Token persistence is best-effort; local notifications still work.
      }
    }
    return token;
  } catch {
    return null;
  }
}

export const subscribeToForegroundMessages = (handler) => {
  try {
    const messaging = loadMessaging();
    return messaging().onMessage(async (remoteMessage) => {
      handler(remoteMessage);
    });
  } catch {
    return () => {};
  }
};

/**
 * Local stand-in for a completed background AI job. In production a Cloud
 * Function would send this data payload through FCM after the worker finishes.
 */
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
