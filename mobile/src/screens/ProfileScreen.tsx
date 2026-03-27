import React from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { getCurrentUser } from '../utils/session';
import { authService } from '../services/auth.service';
import { ticketService } from '../services/ticket.service';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [ticketsCount, setTicketsCount] = React.useState(0);
  const avatarUri = 'https://i.pravatar.cc/240?img=12';

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        const user = await getCurrentUser();
        if (!active) return;
        setIsLoggedIn(Boolean(user));
        setName(user?.fullName || 'Guest');
        setEmail(user?.email || '-');
        if (user) {
          const count = await ticketService.getMyTicketsCount();
          if (active) setTicketsCount(count);
        } else {
          setTicketsCount(0);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const onLogout = () => {
    showAlert('Xác nhận', 'Bạn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          setIsLoggedIn(false);
          setName('Guest');
          setEmail('-');
          setTicketsCount(0);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tài khoản</Text>
      <View style={styles.card}>
        {isLoggedIn ? (
          <>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.meta}>CineTicket Member</Text>

            <View style={styles.statsRow}>
              <Pressable style={styles.statCard} onPress={() => navigation.navigate('MyTickets')}>
                <Ionicons name="ticket-outline" size={20} color="#4338ca" />
                <Text style={styles.statValue}>{ticketsCount}</Text>
                <Text style={styles.statLabel}>Vé đã đặt</Text>
              </Pressable>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Họ tên</Text>
                <Text style={styles.infoValue}>{name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
            </View>
            <Pressable style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.guestIcon}>
              <Ionicons name="person-outline" size={48} color="#d1d5db" />
            </View>
            <Text style={styles.name}>Bạn chưa đăng nhập</Text>
            <Text style={styles.email}>Đăng nhập để đặt vé và quản lý vé của bạn.</Text>
            <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Đăng nhập ngay</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  avatarWrap: { alignItems: 'center', marginTop: 2, marginBottom: 10 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#d1d5db' },
  guestIcon: { alignItems: 'center', marginVertical: 16 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  email: { marginTop: 4, fontSize: 15, color: '#6b7280', textAlign: 'center' },
  meta: { marginTop: 10, color: '#94a3b8', textAlign: 'center' },
  statsRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#eef2ff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#312e81' },
  statLabel: { fontSize: 12, color: '#4b5563' },
  infoList: {
    marginTop: 14, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  infoLabel: { color: '#6b7280', fontSize: 13, minWidth: 60 },
  infoValue: { flex: 1, color: '#111827', fontWeight: '600', fontSize: 13 },
  loginBtn: { marginTop: 14, backgroundColor: '#4338ca', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  loginText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  logoutBtn: { marginTop: 14, backgroundColor: '#dc2626', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
