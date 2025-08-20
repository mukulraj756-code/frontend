import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Notification } from '@/types/earnPage.types';
import { EARN_COLORS } from '@/constants/EarnPageColors';
import NotificationCard from './NotificationCard';

interface NotificationSectionProps {
  notifications: Notification[];
  onNotificationPress: (notification: Notification) => void;
}

export default function NotificationSection({ 
  notifications, 
  onNotificationPress 
}: NotificationSectionProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          🔔 Important notifications
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Stay updated with the latest info
        </ThemedText>
      </View>
      
      {/* Notification Cards */}
      <View style={styles.notificationsList}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => onNotificationPress(notification)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 28,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: EARN_COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: EARN_COLORS.textSecondary,
  },
  notificationsList: {
    gap: 12, // adds clean spacing between cards
  },
});
