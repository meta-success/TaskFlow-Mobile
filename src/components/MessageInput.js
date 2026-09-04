import React, {useState} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors, radius} from '../theme';

export function MessageInput({
  onSend,
  placeholder = 'Message Aura…',
  disabled = false,
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
          style={[styles.accessory, accessoryActive && styles.accessoryOn]}
          accessibilityLabel="Toggle RAG">
          <Ionicons
            name="folder-open"
            size={18}
            color={accessoryActive ? colors.accent : colors.text}
          />
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
        style={[styles.send, (!value.trim() || disabled) && styles.sendOff]}
        accessibilityLabel="Send">
        <Ionicons name="send" size={18} color="#3B2200" />
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
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(18, 8, 48, 0.72)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: {
    opacity: 0.35,
  },
  accessory: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  accessoryOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
});
