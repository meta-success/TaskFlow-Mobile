import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AuraLogo} from './AuraLogo';
import {colors} from '../theme';

export function BootScreen() {
  return (
    <View style={styles.root}>
      <AuraLogo size={220} />
      <Text style={styles.title}>Aura AI</Text>
      <Text style={styles.subtitle}>Waking the atelier…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 22,
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    color: '#7EE0FF',
    fontWeight: '600',
  },
});
