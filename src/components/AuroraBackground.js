import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {colors} from '../theme';

export function AuroraBackground() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const rise = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const fall = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.wash} />
      <Animated.View style={[styles.orb, styles.purple, {transform: [{translateY: rise}]}]} />
      <Animated.View style={[styles.orb, styles.gold, {transform: [{translateY: fall}]}]} />
      <Animated.View style={[styles.orb, styles.rose]} />
      <View style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  purple: {
    width: 280,
    height: 280,
    top: -80,
    right: -70,
    backgroundColor: colors.glowPurple,
  },
  gold: {
    width: 220,
    height: 220,
    top: 160,
    left: -90,
    backgroundColor: colors.glowGold,
  },
  rose: {
    width: 180,
    height: 180,
    bottom: 80,
    right: -40,
    backgroundColor: colors.glowRose,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 5, 15, 0.28)',
  },
});
