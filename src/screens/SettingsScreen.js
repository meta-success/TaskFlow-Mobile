import React from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {PrimaryButton} from '../components/PrimaryButton';
import {Screen} from '../components/Screen';
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
  {id: 'openai', label: 'OpenAI'},
  {id: 'auto', label: 'Auto'},
  {id: 'gemini', label: 'Gemini'},
  {id: 'openrouter', label: 'Router'},
  {id: 'on-device', label: 'On-device'},
];

function Chip({selected, label, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

function StatusRow({icon, label, ok, detail}) {
  return (
    <View style={styles.statusRow}>
      <Ionicons name={icon} size={18} color={ok ? colors.online : colors.textDim} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, ok && styles.statusOk]}>{detail}</Text>
    </View>
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

  const modelCatalog =
    provider === 'gemini'
      ? MODEL_CATALOG.gemini
      : provider === 'openrouter'
        ? MODEL_CATALOG.openrouter
        : provider === 'on-device'
          ? []
          : MODEL_CATALOG.openai;

  const selectedModel =
    provider === 'gemini'
      ? geminiModel
      : provider === 'openrouter'
        ? openrouterModel
        : openaiModel;

  const onPickModel = (id) => {
    if (provider === 'gemini') {
      setGeminiModel(id);
      return;
    }
    if (provider === 'openrouter') {
      setOpenrouterModel(id);
      return;
    }
    setOpenAiModel(id);
  };

  return (
    <Screen scroll>
      <SafeAreaView edges={['top']}>
        <Text style={styles.kicker}>Account</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.body} numberOfLines={1}>
          {user?.email || 'Guest session'}
        </Text>

        <Text style={styles.section}>Keys</Text>
        <View style={styles.card}>
          <StatusRow
            icon="key-outline"
            label="OpenAI"
            ok={hasOpenAiKey()}
            detail={hasOpenAiKey() ? maskSecret(getOpenAiKey()) : 'Add to .env'}
          />
          <StatusRow
            icon="server-outline"
            label="Supabase"
            ok={hasSupabaseConfig()}
            detail={hasSupabaseConfig() ? 'Ready' : 'Optional'}
          />
          <StatusRow
            icon="logo-google"
            label="Google"
            ok={hasGoogleSignInConfig()}
            detail={hasGoogleSignInConfig() ? 'Ready' : 'Optional'}
          />
          <StatusRow
            icon="flash-outline"
            label="Gemini"
            ok={hasGeminiKey()}
            detail={hasGeminiKey() ? 'Ready' : 'Optional'}
          />
          <StatusRow
            icon="git-network-outline"
            label="OpenRouter"
            ok={hasOpenRouterKey()}
            detail={hasOpenRouterKey() ? 'Ready' : 'Optional'}
          />
        </View>

        <Text style={styles.section}>Provider</Text>
        <View style={styles.chips}>
          {PROVIDERS.map((item) => (
            <Chip
              key={item.id}
              selected={provider === item.id}
              label={item.label}
              onPress={() => setProvider(item.id)}
            />
          ))}
        </View>

        {modelCatalog.length ? (
          <>
            <Text style={styles.section}>Model</Text>
            <View style={styles.chips}>
              {modelCatalog.map((item) => (
                <Chip
                  key={item.id}
                  selected={selectedModel === item.id}
                  label={item.label}
                  onPress={() => onPickModel(item.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.switchRow}>
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          <Text style={styles.switchLabel}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={colors.text}
            trackColor={{true: colors.primary, false: colors.border}}
          />
        </View>

        <PrimaryButton
          icon="log-out-outline"
          label="Sign out"
          variant="danger"
          onPress={signOut}
        />
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
    fontSize: 32,
    marginTop: 2,
  },
  body: {
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 15,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  statusLabel: {
    color: colors.text,
    fontWeight: '700',
    width: 88,
  },
  statusValue: {
    flex: 1,
    color: colors.textDim,
    textAlign: 'right',
    fontSize: 12,
  },
  statusOk: {
    color: colors.online,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextOn: {
    color: colors.accent,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginVertical: 18,
  },
  switchLabel: {
    flex: 1,
    color: colors.text,
    fontWeight: '700',
  },
});
