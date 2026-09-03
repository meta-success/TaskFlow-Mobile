import React, {useMemo, useRef, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
  const documents = useAppStore((state) => state.documents);
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
      ? 'Edge AI'
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
              {conversation?.title || 'New conversation'}
            </Text>
            <Text style={styles.meta}>
              {modelName}
              {useRag ? '  ·  grounded' : ''}
            </Text>
          </View>
          <Pressable
            style={styles.newBtn}
            onPress={() => openConversation(createConversation())}>
            <Text style={styles.newText}>New</Text>
          </Pressable>
        </View>

        {!isOnline ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              You are offline. Aura is answering with the on-device model.
            </Text>
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
              <Text style={styles.emptyGlyph}>◎</Text>
              <Text style={styles.emptyTitle}>A quiet room</Text>
              <Text style={styles.empty}>
                Ask anything. OpenAI will reply with your key. Turn on RAG to
                consult uploaded documents.
              </Text>
            </View>
          }
          ListFooterComponent={chatLoading ? <TypingDots /> : null}
        />

        <MessageInput
          onSend={(text) => sendMessage(text, {useRag})}
          disabled={chatLoading}
          accessoryLabel={documents.length ? `RAG ${documents.length}` : 'RAG'}
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  meta: {
    color: colors.accent,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  newBtn: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  newText: {
    color: colors.accent,
    fontWeight: '800',
  },
  banner: {
    marginHorizontal: 18,
    marginBottom: 6,
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 12,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyCard: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  emptyGlyph: {
    color: colors.accent,
    fontSize: 28,
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  empty: {
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
});
