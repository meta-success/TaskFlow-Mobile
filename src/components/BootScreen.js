import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AuraLogo} from './AuraLogo';
import {AuraWordmark} from './AuraWordmark';
import {colors} from '../theme';

export function BootScreen() {
  return (
    <View style={styles.root}>
      <AuraLogo size={220} />
      <View style={styles.wordmark}>
        <AuraWordmark size="lg" />
      </View>
      <Text style={styles.subtitle}>Waking the atelier…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  wordmark: {
    marginTop: 18,
  },
  subtitle: {
    marginTop: 6,
    color: '#7EE0FF',
    fontWeight: '600',
  },
});
