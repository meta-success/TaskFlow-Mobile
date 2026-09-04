import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {colors} from '../theme';

export function AuroraBackground() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 7000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const rise = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -36],
  });
  const fall = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });
  const slide = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 20],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#6D28D9', '#2563EB', '#1E1B4B']}
        start={{x: 0.1, y: 0}}
        end={{x: 0.9, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[styles.orb, styles.magenta, {transform: [{translateY: rise}]}]}
      />
      <Animated.View
        style={[styles.orb, styles.gold, {transform: [{translateY: fall}]}]}
      />
      <Animated.View
        style={[styles.orb, styles.cyan, {transform: [{translateX: slide}]}]}
      />
      <Animated.View style={[styles.orb, styles.rose]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  magenta: {
    width: 320,
    height: 320,
    top: -90,
    right: -80,
    backgroundColor: colors.glowPurple,
  },
  gold: {
    width: 240,
    height: 240,
    top: 140,
    left: -90,
    backgroundColor: colors.glowGold,
  },
  cyan: {
    width: 200,
    height: 200,
    bottom: 120,
    right: -50,
    backgroundColor: colors.glowCyan,
  },
  rose: {
    width: 170,
    height: 170,
    bottom: -30,
    left: 40,
    backgroundColor: colors.glowRose,
  },
});
