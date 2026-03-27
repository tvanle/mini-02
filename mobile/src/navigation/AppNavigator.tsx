import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { ShowtimeListScreen } from '../screens/ShowtimeListScreen';
import { SeatSelectionScreen } from '../screens/SeatSelectionScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { MyTicketsScreen } from '../screens/MyTicketsScreen';
import { getCurrentUser } from '../utils/session';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getCurrentUser();
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ title: 'Chi tiết phim' }} />
      <Stack.Screen name="ShowtimeList" component={ShowtimeListScreen} options={{ title: 'Lịch chiếu' }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Chọn ghế' }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} options={{ title: 'Vé của tôi' }} />
    </Stack.Navigator>
  );
}
