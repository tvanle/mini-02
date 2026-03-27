import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { MainTabParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { orderService } from '../services/order.service';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      const count = await orderService.getPendingItemsCount();
      setCartCount(count);
    };

    loadCount();
    const unsub = orderService.subscribeCartUpdates(loadCount);
    return unsub;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4338ca',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarActiveBackgroundColor: '#eef2ff',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarItemStyle: {
          marginVertical: 8,
          borderRadius: 14,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          paddingHorizontal: 8,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: '#ffffff',
          elevation: 14,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 2 : size;
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={iconSize} color={color} />;
            case 'Explore':
              return <Ionicons name={focused ? 'grid' : 'grid-outline'} size={iconSize} color={color} />;
            case 'Cart':
              return (
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons
                    name={focused ? 'shopping-outline' : 'shopping-outline'}
                    size={iconSize}
                    color={color}
                  />
                  {cartCount > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : String(cartCount)}</Text>
                    </View>
                  ) : null}
                </View>
              );
            case 'Orders':
              return (
                <MaterialCommunityIcons
                  name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
                  size={iconSize}
                  color={color}
                />
              );
            case 'Profile':
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={iconSize} color={color} />;
            default:
              return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen as React.ComponentType<any>} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen
        name="Explore"
        component={ProductListScreen as React.ComponentType<any>}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen name="Cart" component={CartScreen as React.ComponentType<any>} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen
        name="Orders"
        component={OrderHistoryScreen as React.ComponentType<any>}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    right: -10,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
