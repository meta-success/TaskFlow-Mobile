import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';

const mascot = require('../../assets/mascot.jpg');

export function LoadingOverlay({visible, label = 'Composing…'}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.card}>
        <Image source={mascot} style={styles.mascot} resizeMode="contain" />
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
    borderColor: 'rgba(126, 224, 255, 0.35)',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
    minWidth: 168,
  },
  mascot: {
    width: 88,
    height: 88,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
});
