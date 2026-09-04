import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {PrimaryButton} from '../components/PrimaryButton';
import {GlassCard} from '../components/GlassCard';
import {AuroraBackground} from '../components/AuroraBackground';
import {AuraLogo} from '../components/AuraLogo';
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
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <AuraLogo size={168} />
              <Text style={styles.kicker}>Welcome to Aura</Text>
              <Text style={styles.title}>Aura AI</Text>
              <Text style={styles.subtitle}>
                Bright chats, Edge AI on your phone, and answers grounded in
                your documents.
              </Text>
            </View>

            <GlassCard glow style={styles.card}>
              <Text style={styles.cardTitle}>
                {mode === 'signin' ? 'Let’s begin' : 'Create your studio'}
              </Text>

              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color={colors.accent} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.accent}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  style={styles.input}
                />
              </View>

              {globalError ? <Text style={styles.error}>{globalError}</Text> : null}
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}

              <View style={styles.actions}>
                <PrimaryButton
                  icon="arrow-forward"
                  label={mode === 'signin' ? 'Continue' : 'Create account'}
                  onPress={submit}
                  loading={authLoading}
                  disabled={!email || !password || !hasSupabaseConfig()}
                />
                <PrimaryButton
                  icon="person-add-outline"
                  label={
                    mode === 'signin'
                      ? 'Create an account'
                      : 'I already have access'
                  }
                  variant="ghost"
                  onPress={() =>
                    setMode(mode === 'signin' ? 'signup' : 'signin')
                  }
                />
                <PrimaryButton
                  icon="logo-google"
                  label="Continue with Google"
                  variant="ghost"
                  onPress={signInWithGoogle}
                  loading={authLoading}
                  disabled={!hasGoogleSignInConfig()}
                  iconColor="#FFFFFF"
                />
                <PrimaryButton
                  icon="sparkles"
                  label="Wander as guest"
                  variant="ghost"
                  onPress={continueAsGuest}
                />
              </View>
            </GlassCard>
          </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  kicker: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 10,
  },
  title: {
    ...typography.display,
    fontSize: 40,
    marginTop: 2,
    textShadowColor: 'rgba(255, 213, 74, 0.55)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 16,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  card: {
    padding: 0,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgInput,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    marginTop: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 10,
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
    marginTop: 10,
  },
  notice: {
    color: colors.accent,
    marginTop: 10,
    fontWeight: '600',
  },
});
