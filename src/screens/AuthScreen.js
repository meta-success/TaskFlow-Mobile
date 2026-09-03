import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuraLogo} from '../components/AuraLogo';
import {PrimaryButton} from '../components/PrimaryButton';
import {GlassCard} from '../components/GlassCard';
import {AuroraBackground} from '../components/AuroraBackground';
import {useAppStore} from '../store/useAppStore';
import {colors, typography} from '../theme';
import {hasGoogleSignInConfig, hasSupabaseConfig} from '../config/env';

export function AuthScreen() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signInWithEmail = useAppStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAppStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAppStore((state) => state.signInWithGoogle);
  const continueAsGuest = useAppStore((state) => state.continueAsGuest);
  const authLoading = useAppStore((state) => state.authLoading);
  const globalError = useAppStore((state) => state.globalError);
  const notice = useAppStore((state) => state.notice);
  const setGlobalError = useAppStore((state) => state.setGlobalError);

  const submit = async () => {
    setGlobalError(null);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        return;
      }
      await signUpWithEmail(email, password);
    } catch {
      // surfaced via store
    }
  };

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            <View style={styles.hero}>
              <AuraLogo size={86} />
              <Text style={styles.kicker}>Private studio</Text>
              <Text style={styles.title}>Aura</Text>
              <Text style={styles.subtitle}>
                A luminous mobile atelier for OpenAI, on-device intelligence,
                and grounded answers.
              </Text>
            </View>

            <GlassCard glow>
              <Text style={styles.cardTitle}>
                {mode === 'signin' ? 'Enter the studio' : 'Create your atelier'}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />
              {globalError ? <Text style={styles.error}>{globalError}</Text> : null}
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}

              <PrimaryButton
                label={mode === 'signin' ? 'Continue' : 'Create account'}
                onPress={submit}
                loading={authLoading}
                disabled={!email || !password || !hasSupabaseConfig()}
              />
              <PrimaryButton
                label={mode === 'signin' ? 'Create an account' : 'I already have access'}
                variant="ghost"
                onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              />
              <PrimaryButton
                label="Continue with Google"
                variant="ghost"
                onPress={signInWithGoogle}
                loading={authLoading}
                disabled={!hasGoogleSignInConfig()}
              />
              <PrimaryButton
                label="Wander as guest"
                variant="ghost"
                onPress={continueAsGuest}
              />
              <Text style={styles.hint}>
                Paste your OpenAI key in Settings after you enter. Guest mode
                keeps chats on this device.
              </Text>
            </GlassCard>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
    gap: 22,
  },
  hero: {
    alignItems: 'flex-start',
    gap: 8,
  },
  kicker: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 10,
  },
  title: {
    ...typography.display,
  },
  subtitle: {
    ...typography.subtitle,
    lineHeight: 22,
    maxWidth: 320,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
  error: {
    color: colors.danger,
    fontWeight: '600',
    marginTop: 8,
  },
  notice: {
    color: colors.accent,
    marginTop: 8,
  },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});
