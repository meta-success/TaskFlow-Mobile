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
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(18, 8, 48, 0.78)',
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: 'rgba(255,255,255,0.16)',
    color: colors.text,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
  sendOff: {
    opacity: 0.35,
  },
  accessory: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  accessoryOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
});
