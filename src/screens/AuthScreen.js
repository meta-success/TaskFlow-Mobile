import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {PrimaryButton} from '../components/PrimaryButton';
import {AuroraBackground} from '../components/AuroraBackground';
import {AuraLogo} from '../components/AuraLogo';
import {AuraWordmark} from '../components/AuraWordmark';
import {useAppStore} from '../store/useAppStore';
import {colors} from '../theme';
import {hasSupabaseConfig} from '../config/env';

export function AuthScreen() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signInWithEmail = useAppStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAppStore((state) => state.signUpWithEmail);
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
              <AuraLogo size={128} />
              <View style={styles.wordmark}>
                <AuraWordmark size="lg" />
              </View>
              <Text style={styles.subtitle}>Chat, documents, and on-device AI.</Text>
            </View>

            <View style={styles.card}>
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
                  icon={mode === 'signin' ? 'arrow-forward' : 'person-add-outline'}
                  label={mode === 'signin' ? 'Continue' : 'Create account'}
                  onPress={submit}
                  loading={authLoading}
                  disabled={!email || !password || !hasSupabaseConfig()}
                />
                <PrimaryButton
                  icon="sparkles-outline"
                  label="Continue as guest"
                  variant="ghost"
                  onPress={continueAsGuest}
                />
              </View>

              <Pressable
                onPress={() =>
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                }
                style={styles.switchMode}>
                <Text style={styles.switchText}>
                  {mode === 'signin'
                    ? 'Need an account? Sign up'
                    : 'Already have access? Sign in'}
                </Text>
              </Pressable>
            </View>
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
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  wordmark: {
    marginTop: 14,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 10,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    padding: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    marginTop: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  actions: {
    marginTop: 14,
    gap: 8,
  },
  switchMode: {
    alignItems: 'center',
    paddingTop: 12,
  },
  switchText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
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
