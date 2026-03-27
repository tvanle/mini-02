import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { MoviesScreen } from '../screens/MoviesScreen';
import { ShowtimesScreen } from '../screens/ShowtimesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4338ca',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarActiveBackgroundColor: '#eef2ff',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarItemStyle: { marginVertical: 8, borderRadius: 14 },
        tabBarStyle: {
          position: 'absolute',
          left: 14, right: 14, bottom: 14,
          height: 74, paddingTop: 8, paddingBottom: 10, paddingHorizontal: 8,
          borderTopWidth: 0, borderRadius: 24, backgroundColor: '#ffffff',
          elevation: 14, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14, shadowRadius: 16,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const s = focused ? size + 2 : size;
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={s} color={color} />;
            case 'Movies':
              return <Ionicons name={focused ? 'film' : 'film-outline'} size={s} color={color} />;
            case 'Showtimes':
              return <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={s} color={color} />;
            case 'Profile':
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={s} color={color} />;
            default:
              return <Ionicons name="ellipse-outline" size={s} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen as React.ComponentType<any>} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Movies" component={MoviesScreen as React.ComponentType<any>} options={{ tabBarLabel: 'Phim' }} />
      <Tab.Screen name="Showtimes" component={ShowtimesScreen as React.ComponentType<any>} options={{ tabBarLabel: 'Lịch chiếu' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}
