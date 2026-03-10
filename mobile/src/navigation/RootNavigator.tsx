import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { UserListScreen } from '../screens/UserListScreen';
import { UserDetailScreen } from '../screens/UserDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'MiniProj' }}
      />
      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={{ title: 'Users' }}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{ title: 'User Detail' }}
      />
    </Stack.Navigator>
  );
}
