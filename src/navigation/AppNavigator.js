import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {ChatScreen} from '../screens/ChatScreen';
import {DocumentsScreen} from '../screens/DocumentsScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {AuthScreen} from '../screens/AuthScreen';
import {useAppStore} from '../store/useAppStore';
import {colors} from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TABS = [
  {key: 'Home', glyph: '✦', label: 'Home'},
  {key: 'Chat', glyph: '◎', label: 'Chat'},
  {key: 'Documents', glyph: '▣', label: 'Docs'},
  {key: 'Settings', glyph: '◈', label: 'Aura'},
];

function AuraTabBar({state, navigation}) {
  return (
    <View style={styles.dock}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TABS.find((item) => item.key === route.name) || {
            glyph: '•',
            label: route.name,
          };
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, focused && styles.itemOn]}>
              <Text style={[styles.glyph, focused && styles.glyphOn]}>
                {meta.glyph}
              </Text>
              <Text style={[styles.caption, focused && styles.captionOn]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={AuraTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const user = useAppStore((state) => state.user);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    padding: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 22,
  },
  itemOn: {
    backgroundColor: colors.primarySoft,
  },
  glyph: {
    color: colors.textDim,
    fontSize: 16,
  },
  glyphOn: {
    color: colors.accent,
  },
  caption: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  captionOn: {
    color: colors.text,
  },
});
