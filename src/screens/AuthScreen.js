import React, {useState} from 'react';
import {
  Image,
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
import {useAppStore} from '../store/useAppStore';
import {colors, typography} from '../theme';
import {hasGoogleSignInConfig, hasSupabaseConfig} from '../config/env';

const mascot = require('../../assets/mascot.jpg');

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
              <Image source={mascot} style={styles.mascot} resizeMode="contain" />
              <Text style={styles.kicker}>Private studio</Text>
              <Text style={styles.title}>Aura</Text>
              <Text style={styles.subtitle}>
                Chat with OpenAI, run Edge AI offline, and ground answers in
                your documents.
              </Text>
            </View>

            <GlassCard glow style={styles.card}>
              <Text style={styles.cardTitle}>
                {mode === 'signin' ? 'Enter the studio' : 'Create your atelier'}
              </Text>

              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color={colors.textDim} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Email"
                  placeholderTextColor={colors.textDim}
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.textDim}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor={colors.textDim}
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
                  iconColor="#E8F1FF"
                />
                <PrimaryButton
                  icon="sparkles-outline"
                  label="Wander as guest"
                  variant="ghost"
                  onPress={continueAsGuest}
                />
              </View>
              <Text style={styles.hint}>
                Paste your OpenAI key in Settings after you enter. Guest mode
                keeps chats on this device.
              </Text>
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mascot: {
    width: 168,
    height: 168,
    marginBottom: 4,
  },
  kicker: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
  },
  title: {
    ...typography.display,
    fontSize: 32,
    marginTop: 2,
  },
  subtitle: {
    ...typography.subtitle,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  card: {
    padding: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgInput,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 8,
  },
  actions: {
    marginTop: 12,
    gap: 8,
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
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
});
