import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {colors, radius} from '../theme';
import {formatTime} from '../utils/format';

const mascot = require('../../assets/mascot.jpg');

function AuraAvatar() {
  return (
    <View style={styles.avatarRing}>
      <Image source={mascot} style={styles.avatarImage} />
    </View>
  );
}

export function ChatBubble({message}) {
  const isUser = message.role === 'user';
  const isError = Boolean(message.error);

  const body = (
    <>
      <Text style={styles.text}>{message.content}</Text>
      <Text style={[styles.time, isUser && styles.timeUser]}>
        {formatTime(message.createdAt)}
      </Text>
      {message.citations?.length ? (
        <View style={styles.citePill}>
          <Text style={styles.cite}>
            Grounded · {message.citations.length} source
            {message.citations.length > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser ? <AuraAvatar /> : null}
      {isUser ? (
        <LinearGradient
          colors={['#C084FC', '#A855F7', '#7C3AED']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.bubble, styles.user, isError && styles.error]}>
          {body}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.assistant, isError && styles.error]}>
          {body}
        </View>
      )}
    </View>
  );
}

export function TypingDots() {
  return (
    <View style={styles.row}>
      <AuraAvatar />
      <View style={[styles.bubble, styles.assistant, styles.typing]}>
        <Text style={styles.typingText}>Aura is composing</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: '#1E1B4B',
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  user: {
    borderBottomRightRadius: 6,
  },
  assistant: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  error: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  time: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 6,
  },
  timeUser: {
    color: 'rgba(255,255,255,0.72)',
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
