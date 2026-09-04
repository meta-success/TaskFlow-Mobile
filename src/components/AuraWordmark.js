import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {colors} from '../theme';

const SIZES = {
  sm: {aura: 22, ai: 22, icon: 13, bar: 40, gap: 5},
  md: {aura: 34, ai: 34, icon: 16, bar: 56, gap: 7},
  lg: {aura: 42, ai: 42, icon: 18, bar: 72, gap: 8},
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
              textShadowRadius: size === 'lg' ? 16 : 10,
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
      <LinearGradient
        colors={['transparent', colors.accent, 'transparent']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0.5}}
        style={[styles.bar, {width: scale.bar, marginTop: scale.gap}]}
      />
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
    letterSpacing: 0.6,
    textShadowColor: 'rgba(232, 121, 249, 0.65)',
    textShadowOffset: {width: 0, height: 0},
  },
  ai: {
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(255, 213, 74, 0.8)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 12,
  },
  spark: {
    marginLeft: 6,
    marginTop: -8,
  },
  bar: {
    height: 2,
    borderRadius: 99,
  },
});
