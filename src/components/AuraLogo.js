import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';

const mascot = require('../../assets/mascot.jpg');

/**
 * Brand mark: mascot clipped in a circle, wrapped in bright gold
 * and orchid rings with a living glow.
 */
export function AuraLogo({size = 160}) {
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    const twinkle = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 9000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    twinkle.start();
    return () => {
      loop.stop();
      twinkle.stop();
    };
  }, [pulse, spin]);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.8],
  });
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ring = size;
  const inner = size * 0.78;
  const core = size * 0.64;
  const spark = size * 0.1;

  return (
    <View
      style={{
        width: ring,
        height: ring,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            opacity: glowOpacity,
            transform: [{scale: glowScale}],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.sparkOrbit,
          {
            width: ring,
            height: ring,
            transform: [{rotate}],
          },
        ]}>
        <View style={[styles.spark, {width: spark, height: spark, top: 4, left: ring / 2 - spark / 2}]} />
        <View
          style={[
            styles.sparkCyan,
            {
              width: spark * 0.7,
              height: spark * 0.7,
              bottom: 8,
              right: 14,
            },
          ]}
        />
        <View
          style={[
            styles.spark,
            {width: spark * 0.55, height: spark * 0.55, left: 8, top: ring * 0.42},
          ]}
        />
      </Animated.View>
      <View
        style={[
          styles.lavender,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
          },
        ]}
      />
      <View
        style={[
          styles.gold,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}
      />
      <View
        style={[
          styles.core,
          {
            width: core,
            height: core,
            borderRadius: core / 2,
          },
        ]}>
        <Image source={mascot} style={{width: core, height: core}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 213, 74, 0.55)',
  },
  sparkOrbit: {
    position: 'absolute',
  },
  spark: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFD54A',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  sparkCyan: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#7DD3FC',
  },
  lavender: {
    position: 'absolute',
    backgroundColor: '#F0ABFC',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  gold: {
    position: 'absolute',
    backgroundColor: '#FFD54A',
  },
  core: {
    overflow: 'hidden',
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
