import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
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
  {key: 'Home', label: 'Home', icon: 'home-outline', iconOn: 'home'},
  {key: 'Chat', label: 'Chat', icon: 'chatbubbles-outline', iconOn: 'chatbubbles'},
  {key: 'Documents', label: 'Docs', icon: 'folder-open-outline', iconOn: 'folder-open'},
  {key: 'Settings', label: 'Settings', icon: 'settings-outline', iconOn: 'settings'},
];

function AuraTabBar({state, navigation}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.dock, {paddingBottom: Math.max(insets.bottom, 10)}]}>
      <LinearGradient
        colors={['rgba(40, 18, 90, 0.94)', 'rgba(18, 8, 48, 0.96)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TABS.find((item) => item.key === route.name);
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, focused && styles.itemOn]}
              accessibilityRole="button"
              accessibilityLabel={meta?.label}>
              <Ionicons
                name={focused ? meta.iconOn : meta.icon}
                size={22}
                color={focused ? colors.accent : 'rgba(255,255,255,0.72)'}
              />
              <Text style={[styles.caption, focused && styles.captionOn]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AuraTabBar {...props} />}
      screenOptions={{headerShown: false}}>
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
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    padding: 5,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 18,
    gap: 3,
  },
  itemOn: {
    backgroundColor: 'rgba(255, 213, 74, 0.22)',
  },
  caption: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  captionOn: {
    color: colors.accent,
  },
});
