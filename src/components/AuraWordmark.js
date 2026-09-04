import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors} from '../theme';

const SIZES = {
  sm: {aura: 22, ai: 22, icon: 14, bar: 36, gap: 4},
  md: {aura: 36, ai: 36, icon: 18, bar: 52, gap: 6},
  lg: {aura: 44, ai: 44, icon: 20, bar: 64, gap: 8},
};

export function AuraWordmark({size = 'md'}) {
  const scale = SIZES[size] || SIZES.md;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text
          style={[
            styles.aura,
            {
              fontSize: scale.aura,
              textShadowRadius: size === 'lg' ? 18 : 12,
            },
          ]}>
          Aura
        </Text>
        <Text style={[styles.ai, {fontSize: scale.ai}]}> AI</Text>
        <Ionicons
          name="sparkles"
          size={scale.icon}
          color={colors.accent}
          style={styles.spark}
        />
      </View>
      <View style={[styles.bar, {width: scale.bar, marginTop: scale.gap}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aura: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(232, 121, 249, 0.7)',
    textShadowOffset: {width: 0, height: 0},
  },
  ai: {
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 213, 74, 0.85)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 14,
  },
  spark: {
    marginLeft: 4,
    marginTop: -6,
  },
  bar: {
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.accent,
  },
});
