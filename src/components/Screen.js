import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {AuroraBackground} from './AuroraBackground';
import {colors} from '../theme';

export function Screen({children, scroll = false, contentStyle}) {
  return (
    <View style={styles.root}>
      <AuroraBackground />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fill: {
    flex: 1,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
});
