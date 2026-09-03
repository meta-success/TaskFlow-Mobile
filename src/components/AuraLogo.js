import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, shadows} from '../theme';

export function AuraLogo({size = 72}) {
  return (
    <View
      style={[
        styles.wrap,
        shadows.gold,
        {
          width: size,
          height: size,
          borderRadius: size / 2.4,
        },
      ]}>
      <View style={[styles.ring, {borderRadius: size / 2.6}]} />
      <Text style={[styles.mark, {fontSize: size * 0.36}]}>A</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    width: '62%',
    height: '62%',
    backgroundColor: 'rgba(243, 199, 122, 0.18)',
    top: '30%',
    left: '28%',
  },
  mark: {
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
