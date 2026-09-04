import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AuraLogo} from './AuraLogo';
import {colors} from '../theme';

export function LoadingOverlay({visible, label = 'Composing…'}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.card}>
        <AuraLogo size={96} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 20,
  },
  card: {
    backgroundColor: 'rgba(8, 8, 12, 0.94)',
    borderColor: 'rgba(185, 164, 232, 0.4)',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
    minWidth: 168,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
});
