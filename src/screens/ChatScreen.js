import React, {useMemo, useRef, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {ChatBubble, TypingDots} from '../components/ChatBubble';
import {MessageInput} from '../components/MessageInput';
import {AuroraBackground} from '../components/AuroraBackground';
import {useAppStore} from '../store/useAppStore';
import {colors} from '../theme';
import {labelForModel} from '../config/env';

export function ChatScreen() {
  const listRef = useRef(null);
  const [useRag, setUseRag] = useState(false);
  const conversations = useAppStore((state) => state.conversations);
  const currentConversationId = useAppStore(
    (state) => state.currentConversationId,
  );
  const chatLoading = useAppStore((state) => state.chatLoading);
  const isOnline = useAppStore((state) => state.isOnline);
  const provider = useAppStore((state) => state.provider);
  const openaiModel = useAppStore((state) => state.openaiModel);
  const sendMessage = useAppStore((state) => state.sendMessage);
  const createConversation = useAppStore((state) => state.createConversation);
  const openConversation = useAppStore((state) => state.openConversation);

  const conversation = useMemo(
    () => conversations.find((item) => item.id === currentConversationId),
    [conversations, currentConversationId],
  );

  const messages = conversation?.messages || [];
  const modelName =
    !isOnline || provider === 'on-device'
      ? 'On-device'
      : provider === 'openai' || provider === 'auto'
        ? labelForModel('openai', openaiModel)
        : provider;

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.toolbar}>
          <View style={styles.flex}>
            <Text style={styles.title} numberOfLines={1}>
              {conversation?.title || 'New chat'}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {modelName}
              {useRag ? ' · RAG' : ''}
            </Text>
          </View>
          <Pressable
            style={styles.iconBtn}
            onPress={() => openConversation(createConversation())}
            accessibilityLabel="New chat">
            <Ionicons name="add" size={22} color={colors.accent} />
          </Pressable>
        </View>

        {!isOnline ? (
          <View style={styles.banner}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.accent} />
            <Text style={styles.bannerText}>Offline — using on-device AI</Text>
          </View>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => <ChatBubble message={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({animated: true})
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={colors.accent}
              />
              <Text style={styles.emptyTitle}>Ask anything</Text>
              <Text style={styles.empty}>
                Replies use your OpenAI key. Turn on RAG to use uploaded docs.
              </Text>
            </View>
          }
          ListFooterComponent={chatLoading ? <TypingDots /> : null}
        />

        <MessageInput
          onSend={(text) => sendMessage(text, {useRag})}
          disabled={chatLoading}
          accessoryActive={useRag}
          onAccessoryPress={() => setUseRag((value) => !value)}
        />
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
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
  },
  meta: {
    color: colors.accent,
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 12,
  },
  list: {
    padding: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyCard: {
    marginTop: 56,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
});
