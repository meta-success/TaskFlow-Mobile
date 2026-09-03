import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '../theme';
import {formatTime} from '../utils/format';

export function ChatBubble({message}) {
  const isUser = message.role === 'user';
  const isError = Boolean(message.error);

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarMark}>A</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          isUser ? styles.user : styles.assistant,
          isError && styles.error,
        ]}>
        <Text style={styles.text}>{message.content}</Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
          {message.model ? <Text style={styles.model}>{message.model}</Text> : null}
        </View>
        {message.citations?.length ? (
          <View style={styles.citePill}>
            <Text style={styles.cite}>
              Grounded · {message.citations.length} source
              {message.citations.length > 1 ? 's' : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function TypingDots() {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarMark}>A</Text>
      </View>
      <View style={[styles.bubble, styles.assistant, styles.typing]}>
        <Text style={styles.typingText}>Aura is composing</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMark: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 12,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  user: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 8,
  },
  assistant: {
    backgroundColor: colors.assistantBubble,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  error: {
    borderColor: colors.danger,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
  },
  meta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  time: {
    color: 'rgba(247,241,255,0.55)',
    fontSize: 11,
  },
  model: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  citePill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cite: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  typing: {
    paddingVertical: 10,
  },
  typingText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
