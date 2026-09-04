import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {Screen} from '../components/Screen';
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
          ? 'On-device'
          : labelForModel('gemini', geminiModel);

  const greeting = user?.user_metadata?.full_name || user?.email || 'Guest';
  const hour = new Date().getHours();
  const hello =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const startChat = () => {
    createConversation();
    navigation.navigate('Chat');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <SafeAreaView edges={['top']}>
        <Text style={styles.kicker}>{hello}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {greeting.split('@')[0]}
        </Text>

        <View style={styles.status}>
          <StatusChip
            icon={isOnline ? 'wifi' : 'cloud-offline-outline'}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? colors.online : colors.offline}
          />
          <StatusChip icon="sparkles-outline" label={modelLabel} />
          <StatusChip
            icon={hasOpenAiKey() ? 'checkmark-circle' : 'alert-circle-outline'}
            label={hasOpenAiKey() ? 'OpenAI' : 'No key'}
            color={hasOpenAiKey() ? colors.online : colors.offline}
          />
        </View>

        <Pressable style={styles.cta} onPress={startChat}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#3B2200" />
          <Text style={styles.ctaText}>New chat</Text>
        </Pressable>

        <View style={styles.actions}>
          <ActionTile
            icon="folder-open"
            title="Documents"
            subtitle={`${documents.length} file${documents.length === 1 ? '' : 's'}`}
            onPress={() => navigation.navigate('Documents')}
          />
          <ActionTile
            icon="pulse"
            title="Sentiment"
            subtitle={
              lastSentiment
                ? `${lastSentiment.label} ${Math.round(lastSentiment.confidence * 100)}%`
                : 'On-device'
            }
            onPress={() =>
              analyzeLocalSentiment('Aura feels elegant, fast, and helpful.')
            }
          />
        </View>

        <Text style={styles.section}>Recent</Text>
        {conversations.length === 0 ? (
          <Text style={styles.empty}>No chats yet. Start one above.</Text>
        ) : (
          conversations.slice(0, 6).map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => {
                openConversation(item.id);
                navigation.navigate('Chat');
              }}>
              <View style={styles.rowIcon}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowMeta}>
                  {formatRelative(item.updatedAt)}
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

function StatusChip({icon, label, color = colors.text}) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ActionTile({icon, title, subtitle, onPress}) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.accent} />
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileBody}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
  },
  kicker: {
    ...typography.caption,
    color: colors.accent,
  },
  title: {
    ...typography.display,
    fontSize: 32,
    marginTop: 2,
  },
  status: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  cta: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#3B2200',
    fontWeight: '800',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  tileTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  tileBody: {
    color: colors.textDim,
    fontSize: 12,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  empty: {
    color: colors.textDim,
  },
  row: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 2,
    fontSize: 12,
  },
  count: {
    color: colors.accent,
    fontWeight: '800',
  },
});
