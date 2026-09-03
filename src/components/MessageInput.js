import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors, radius} from '../theme';

export function MessageInput({
  onSend,
  placeholder = 'Ask Aura anything…',
  disabled = false,
  accessoryLabel,
  accessoryActive = false,
  onAccessoryPress,
}) {
  const [value, setValue] = useState('');

  const submit = () => {
    const next = value.trim();
    if (!next || disabled) {
      return;
    }
    onSend(next);
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      {onAccessoryPress ? (
        <Pressable
          onPress={onAccessoryPress}
          style={[styles.accessory, accessoryActive && styles.accessoryOn]}>
          <Text style={styles.accessoryText}>{accessoryLabel || 'RAG'}</Text>
        </Pressable>
      ) : null}
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        style={styles.input}
        multiline
        editable={!disabled}
        onSubmitEditing={submit}
      />
      <Pressable
        onPress={submit}
        disabled={disabled || !value.trim()}
        style={[styles.send, (!value.trim() || disabled) && styles.sendOff]}>
        <Text style={styles.sendText}>↑</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    backgroundColor: 'rgba(16, 12, 28, 0.92)',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: {
    opacity: 0.35,
  },
  sendText: {
    color: '#2A1B08',
    fontWeight: '800',
    fontSize: 20,
    marginTop: -2,
  },
  accessory: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  accessoryOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  accessoryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
