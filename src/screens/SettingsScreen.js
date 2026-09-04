import React from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PrimaryButton} from '../components/PrimaryButton';
import {Screen} from '../components/Screen';
import {GlassCard} from '../components/GlassCard';
import {useAppStore} from '../store/useAppStore';
import {colors, typography} from '../theme';
import {
  MODEL_CATALOG,
  getOpenAiKey,
  hasGeminiKey,
  hasGoogleSignInConfig,
  hasOpenAiKey,
  hasOpenRouterKey,
  hasSupabaseConfig,
} from '../config/env';
import {maskSecret} from '../utils/format';

const PROVIDERS = [
  {id: 'openai', label: 'OpenAI', hint: 'Your official API key'},
  {id: 'auto', label: 'Auto', hint: 'OpenAI, then Gemini, then OpenRouter'},
  {id: 'gemini', label: 'Gemini', hint: 'Optional Google fallback'},
  {id: 'openrouter', label: 'OpenRouter', hint: 'Optional multi-model router'},
  {id: 'on-device', label: 'On-device', hint: 'Edge sentiment, no cloud'},
];

function ChoiceRow({selected, title, hint, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceOn]}>
      <View style={styles.flex}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceHint}>{hint}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const provider = useAppStore((state) => state.provider);
  const openaiModel = useAppStore((state) => state.openaiModel);
  const geminiModel = useAppStore((state) => state.geminiModel);
  const openrouterModel = useAppStore((state) => state.openrouterModel);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setProvider = useAppStore((state) => state.setProvider);
  const setOpenAiModel = useAppStore((state) => state.setOpenAiModel);
  const setGeminiModel = useAppStore((state) => state.setGeminiModel);
  const setOpenrouterModel = useAppStore((state) => state.setOpenrouterModel);
  const setNotificationsEnabled = useAppStore(
    (state) => state.setNotificationsEnabled,
  );
  const signOut = useAppStore((state) => state.signOut);
  const user = useAppStore((state) => state.user);
  const lastNotification = useAppStore((state) => state.lastNotification);

  return (
    <Screen scroll>
      <SafeAreaView edges={['top']}>
        <Text style={styles.kicker}>Studio</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.body}>
          Signed in as {user?.email || 'local session'}. Add keys in your .env
          file (EXPO_PUBLIC_…). Restart Expo after you change them.
        </Text>

        <GlassCard style={styles.block}>
          <Text style={styles.sectionTop}>OpenAI</Text>
          <Text style={styles.kv}>
            Key: {hasOpenAiKey() ? maskSecret(getOpenAiKey()) : 'Add EXPO_PUBLIC_OPENAI_API_KEY to .env'}
          </Text>
        </GlassCard>

        <Text style={styles.section}>Provider</Text>
        {PROVIDERS.map((item) => (
          <ChoiceRow
            key={item.id}
            selected={provider === item.id}
            title={item.label}
            hint={item.hint}
            onPress={() => setProvider(item.id)}
          />
        ))}

        <Text style={styles.section}>OpenAI models</Text>
        {MODEL_CATALOG.openai.map((item) => (
          <ChoiceRow
            key={item.id}
            selected={openaiModel === item.id}
            title={item.label}
            hint={item.hint}
            onPress={() => setOpenAiModel(item.id)}
          />
        ))}

        <Text style={styles.section}>Optional Gemini models</Text>
        {MODEL_CATALOG.gemini.map((item) => (
          <ChoiceRow
            key={item.id}
            selected={geminiModel === item.id}
            title={item.label}
            hint={item.hint}
            onPress={() => setGeminiModel(item.id)}
          />
        ))}

        <Text style={styles.section}>Optional OpenRouter models</Text>
        {MODEL_CATALOG.openrouter.map((item) => (
          <ChoiceRow
            key={item.id}
            selected={openrouterModel === item.id}
            title={item.label}
            hint={item.hint}
            onPress={() => setOpenrouterModel(item.id)}
          />
        ))}

        <GlassCard style={styles.block}>
          <Text style={styles.sectionTop}>Integrations</Text>
          <Text style={styles.kv}>
            OpenAI: {hasOpenAiKey() ? 'Ready' : 'Missing'}
          </Text>
          <Text style={styles.kv}>
            Gemini: {hasGeminiKey() ? 'Ready' : 'Optional'}
          </Text>
          <Text style={styles.kv}>
            OpenRouter: {hasOpenRouterKey() ? 'Ready' : 'Optional'}
          </Text>
          <Text style={styles.kv}>
            Supabase: {hasSupabaseConfig() ? 'Ready' : 'Optional'}
          </Text>
          <Text style={styles.kv}>
            Google Sign-In: {hasGoogleSignInConfig() ? 'Ready' : 'Optional'}
          </Text>
        </GlassCard>

        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <Text style={styles.choiceTitle}>AI job notifications</Text>
            <Text style={styles.choiceHint}>
              FCM when a background generation finishes
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={colors.text}
            trackColor={{true: colors.primary, false: colors.border}}
          />
        </View>
        {lastNotification ? (
          <Text style={styles.notice}>
            Last push: {lastNotification.title} — {lastNotification.body}
          </Text>
        ) : null}

        <PrimaryButton label="Leave the studio" variant="danger" onPress={signOut} />
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.caption,
    color: colors.accent,
  },
  title: {
    ...typography.display,
    marginTop: 4,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 8,
  },
  block: {
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 16,
  },
  sectionTop: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  choice: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  choiceTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  choiceHint: {
    color: colors.textDim,
    marginTop: 3,
    fontSize: 12,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  radioOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  kv: {
    color: colors.textMuted,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginVertical: 12,
  },
  flex: {
    flex: 1,
  },
  notice: {
    color: colors.accent,
    marginBottom: 8,
  },
});
