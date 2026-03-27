import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Ticket } from '../types';
import { getCurrentUser } from '../utils/session';
import { authService } from '../services/auth.service';
import { ticketService } from '../services/ticket.service';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
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
          const res = await ticketService.getMyTickets();
          if (active && res.success && res.data) setTickets(res.data);
        } else {
          setTickets([]);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const today = new Date().toISOString().split('T')[0];
  const upcomingTickets = tickets.filter(t => (t.showDate || '') >= today);
  const pastTickets = tickets.filter(t => (t.showDate || '') < today);
  const displayedTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  const formatDate = (d?: string) => {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const onLogout = () => {
    Alert.alert('Xác nhận', 'Bạn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          setIsLoggedIn(false);
          setName('Guest');
          setEmail('-');
          setTickets([]);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient effect */}
      <View style={styles.headerBg}>
        <View style={styles.headerOverlay} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {isLoggedIn ? (
          <>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.memberText}>CineTicket Member</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="ticket" size={20} color="#4338ca" />
                </View>
                <Text style={styles.statValue}>{tickets.length}</Text>
                <Text style={styles.statLabel}>Tổng vé</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                </View>
                <Text style={styles.statValue}>{upcomingTickets.length}</Text>
                <Text style={styles.statLabel}>Sắp tới</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="time" size={20} color="#d97706" />
                </View>
                <Text style={styles.statValue}>{pastTickets.length}</Text>
                <Text style={styles.statLabel}>Đã xem</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.guestAvatarWrap}>
              <Ionicons name="person-circle-outline" size={80} color="#d1d5db" />
            </View>
            <Text style={styles.name}>Chào bạn!</Text>
            <Text style={styles.guestText}>Đăng nhập để đặt vé và quản lý vé của bạn</Text>
            <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.loginText}>Đăng nhập ngay</Text>
            </Pressable>
            <Pressable style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Ticket Management Section */}
      {isLoggedIn && (
        <View style={styles.ticketSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quản lý vé</Text>
            <Pressable onPress={() => navigation.navigate('MyTickets')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
              onPress={() => setActiveTab('upcoming')}
            >
              <Ionicons
                name="calendar"
                size={16}
                color={activeTab === 'upcoming' ? '#4338ca' : '#9ca3af'}
              />
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
                Sắp tới ({upcomingTickets.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'past' && styles.tabActive]}
              onPress={() => setActiveTab('past')}
            >
              <Ionicons
                name="checkmark-done"
                size={16}
                color={activeTab === 'past' ? '#4338ca' : '#9ca3af'}
              />
              <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
                Đã xem ({pastTickets.length})
              </Text>
            </Pressable>
          </View>

          {/* Ticket List */}
          {displayedTickets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name={activeTab === 'upcoming' ? 'ticket-outline' : 'film-outline'}
                  size={40}
                  color="#d1d5db"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'upcoming' ? 'Chưa có vé sắp tới' : 'Chưa có vé đã xem'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'upcoming'
                  ? 'Đặt vé ngay để xem phim yêu thích!'
                  : 'Lịch sử vé sẽ hiển thị ở đây'}
              </Text>
              {activeTab === 'upcoming' && (
                <Pressable
                  style={styles.browseBtn}
                  onPress={() => navigation.navigate('MainTabs')}
                >
                  <Text style={styles.browseBtnText}>Khám phá phim</Text>
                </Pressable>
              )}
            </View>
          ) : (
            displayedTickets.slice(0, 3).map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <Image
                  source={{ uri: ticket.moviePoster || 'https://picsum.photos/seed/ticket/400/600' }}
                  style={styles.ticketPoster}
                />
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketMovie} numberOfLines={1}>{ticket.movieTitle}</Text>
                  <Text style={styles.ticketTheater} numberOfLines={1}>{ticket.theaterName}</Text>
                  <View style={styles.ticketMeta}>
                    <View style={styles.ticketBadge}>
                      <Ionicons name="calendar-outline" size={12} color="#4338ca" />
                      <Text style={styles.ticketBadgeText}>{formatDate(ticket.showDate)}</Text>
                    </View>
                    <View style={styles.ticketBadge}>
                      <Ionicons name="time-outline" size={12} color="#4338ca" />
                      <Text style={styles.ticketBadgeText}>{ticket.showTime}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.ticketSeat}>
                  <Text style={styles.seatLabel}>Ghế</Text>
                  <Text style={styles.seatValue}>{ticket.seatNumber}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Quick Actions */}
      {isLoggedIn && (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.actionsList}>
            <Pressable style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
                <Ionicons name="person-outline" size={20} color="#4338ca" />
              </View>
              <Text style={styles.actionText}>Thông tin cá nhân</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Pressable style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="notifications-outline" size={20} color="#d97706" />
              </View>
              <Text style={styles.actionText}>Thông báo</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Pressable style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#16a34a" />
              </View>
              <Text style={styles.actionText}>Trợ giúp & Hỗ trợ</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Pressable style={styles.actionItem} onPress={onLogout}>
              <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>
              <Text style={[styles.actionText, { color: '#dc2626' }]}>Đăng xuất</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  headerBg: {
    height: 140,
    backgroundColor: '#4338ca',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#312e81',
    opacity: 0.3,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -70,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    alignItems: 'center',
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#e5e7eb',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#fff',
  },
  guestAvatarWrap: { marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  guestText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  memberText: { fontSize: 12, fontWeight: '600', color: '#d97706' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statDivider: { width: 1, height: 50, backgroundColor: '#e5e7eb' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4338ca',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  loginText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerBtn: { marginTop: 12 },
  registerText: { color: '#4338ca', fontWeight: '600', fontSize: 14 },
  ticketSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#4338ca' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  tabTextActive: { color: '#4338ca' },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  browseBtn: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  browseBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ticketPoster: {
    width: 50,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  ticketInfo: { flex: 1, marginLeft: 12 },
  ticketMovie: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ticketTheater: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  ticketMeta: { flexDirection: 'row', gap: 6, marginTop: 8 },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketBadgeText: { fontSize: 11, fontWeight: '600', color: '#4338ca' },
  ticketSeat: {
    alignItems: 'center',
    backgroundColor: '#4338ca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  seatLabel: { fontSize: 10, color: '#c7d2fe' },
  seatValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  actionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionsList: { marginTop: 12 },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },
});
