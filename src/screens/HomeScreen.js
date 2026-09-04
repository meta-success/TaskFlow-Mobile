import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Screen} from '../components/Screen';
import {GlassCard} from '../components/GlassCard';
import {useAppStore} from '../store/useAppStore';
import {colors, typography} from '../theme';
import {formatRelative} from '../utils/format';
import {hasOpenAiKey, labelForModel} from '../config/env';

export function HomeScreen() {
  const navigation = useNavigation();
  const user = useAppStore((state) => state.user);
  const isOnline = useAppStore((state) => state.isOnline);
  const provider = useAppStore((state) => state.provider);
  const openaiModel = useAppStore((state) => state.openaiModel);
  const geminiModel = useAppStore((state) => state.geminiModel);
  const openrouterModel = useAppStore((state) => state.openrouterModel);
  const conversations = useAppStore((state) => state.conversations);
  const documents = useAppStore((state) => state.documents);
  const lastSentiment = useAppStore((state) => state.lastSentiment);
  const createConversation = useAppStore((state) => state.createConversation);
  const openConversation = useAppStore((state) => state.openConversation);
  const analyzeLocalSentiment = useAppStore(
    (state) => state.analyzeLocalSentiment,
  );

  const modelLabel =
    provider === 'openai' || provider === 'auto'
      ? labelForModel('openai', openaiModel)
      : provider === 'openrouter'
        ? labelForModel('openrouter', openrouterModel)
        : provider === 'on-device'
          ? 'Edge sentiment'
          : labelForModel('gemini', geminiModel);

  const greeting = user?.user_metadata?.full_name || user?.email || 'Guest';

  const startChat = () => {
    createConversation();
    navigation.navigate('Chat');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <SafeAreaView edges={['top']}>
        <Text style={styles.kicker}>
          {new Date().getHours() < 12
            ? 'Good morning'
            : new Date().getHours() < 18
              ? 'Good afternoon'
              : 'Good evening'}
        </Text>
        <Text style={styles.title}>{greeting.split('@')[0]}</Text>
        <Text style={styles.lede}>
          Your studio is ready. OpenAI when you are connected. Edge
          intelligence when you are not.
        </Text>

        <View style={styles.statusRow}>
          <View style={[styles.pill, isOnline ? styles.online : styles.offline]}>
            <View style={[styles.dot, isOnline ? styles.dotOn : styles.dotOff]} />
            <Text style={styles.pillText}>
              {isOnline ? 'Live' : 'Offline · Edge'}
            </Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{modelLabel}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {hasOpenAiKey() ? 'OpenAI ready' : 'No .env key'}
            </Text>
          </View>
        </View>

        <GlassCard glow style={styles.hero}>
          <Text style={styles.heroKicker}>Tonight’s canvas</Text>
          <Text style={styles.heroTitle}>Start a luminous conversation</Text>
          <Text style={styles.heroBody}>
            GPT replies with your own key. Toggle RAG to ground answers in your
            documents.
          </Text>
          <Pressable style={styles.heroBtn} onPress={startChat}>
            <Text style={styles.heroBtnText}>New conversation</Text>
          </Pressable>
        </GlassCard>

        <View style={styles.grid}>
          <Pressable
            style={styles.tile}
            onPress={() => navigation.navigate('Documents')}>
            <Text style={styles.tileGlyph}>▣</Text>
            <Text style={styles.tileTitle}>Knowledge</Text>
            <Text style={styles.tileBody}>
              {documents.length} indexed file{documents.length === 1 ? '' : 's'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.tile}
            onPress={() =>
              analyzeLocalSentiment(
                'Aura feels elegant, fast, and genuinely helpful.',
              )
            }>
            <Text style={styles.tileGlyph}>✧</Text>
            <Text style={styles.tileTitle}>Sentiment</Text>
            <Text style={styles.tileBody}>
              {lastSentiment
                ? `${lastSentiment.label} · ${Math.round(lastSentiment.confidence * 100)}%`
                : 'Run on-device AI'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Recent rooms</Text>
        {conversations.length === 0 ? (
          <Text style={styles.empty}>
            No conversations yet. Begin one and it will live on this device —
            and in Supabase when you sign in.
          </Text>
        ) : (
          conversations.slice(0, 6).map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => {
                openConversation(item.id);
                navigation.navigate('Chat');
              }}>
              <View style={styles.rowMark}>
                <Text style={styles.rowGlyph}>◎</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.provider || 'aura'} · {formatRelative(item.updatedAt)}
                </Text>
              </View>
              <Text style={styles.count}>{item.messages.length}</Text>
            </Pressable>
          ))
        )}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  kicker: {
    ...typography.caption,
    color: colors.accent,
  },
  title: {
    ...typography.display,
    marginTop: 4,
  },
  lede: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  online: {
    borderColor: 'rgba(126,224,184,0.4)',
  },
  offline: {
    borderColor: 'rgba(255,138,91,0.45)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOn: {
    backgroundColor: colors.online,
  },
  dotOff: {
    backgroundColor: colors.offline,
  },
  pillText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  hero: {
    marginTop: 20,
    padding: 20,
  },
  heroKicker: {
    ...typography.caption,
    color: colors.primary,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.4,
  },
  heroBody: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  heroBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroBtnText: {
    color: '#2A1B08',
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    minHeight: 132,
  },
  tileGlyph: {
    color: colors.accent,
    fontSize: 20,
  },
  tileTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  tileBody: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 13,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginTop: 28,
    marginBottom: 12,
  },
  empty: {
    color: colors.textDim,
    lineHeight: 21,
  },
  row: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  rowMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowGlyph: {
    color: colors.accent,
    fontSize: 16,
  },
  flex: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  rowMeta: {
    color: colors.textDim,
    marginTop: 4,
    fontSize: 12,
  },
  count: {
    color: colors.accent,
    fontWeight: '800',
  },
});
