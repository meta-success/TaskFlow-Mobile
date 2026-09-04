import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';

const mascot = require('../../assets/mascot.jpg');

/**
 * Brand mark: mascot clipped in a circle, wrapped in a gold core
 * and a lavender ring with a soft pulse.
 */
export function AuraLogo({size = 160}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.62],
  });

  const ring = size;
  const inner = size * 0.78;
  const core = size * 0.64;

  return (
    <View style={{width: ring, height: ring, alignItems: 'center', justifyContent: 'center'}}>
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
    backgroundColor: 'rgba(192, 132, 252, 0.45)',
  },
  lavender: {
    position: 'absolute',
    backgroundColor: '#B9A4E8',
  },
  gold: {
    position: 'absolute',
    backgroundColor: '#F3C77A',
  },
  core: {
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
