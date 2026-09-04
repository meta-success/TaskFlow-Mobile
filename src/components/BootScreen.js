import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';

const mascot = require('../../assets/mascot.jpg');

export function BootScreen() {
  const pulse = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.92,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.root}>
      <Animated.View style={{transform: [{scale: pulse}]}}>
        <Image source={mascot} style={styles.mascot} resizeMode="contain" />
      </Animated.View>
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
  mascot: {
    width: 300,
    height: 300,
  },
  title: {
    marginTop: 18,
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
