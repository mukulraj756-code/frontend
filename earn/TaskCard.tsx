import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface TaskCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  reward: number;
  onPress?: () => void;
  isCompleted?: boolean;
  isPending?: boolean;
}

export default function TaskCard({ 
  title, 
  description, 
  icon, 
  iconColor, 
  reward, 
  onPress,
  isCompleted = false,
  isPending = false
}: TaskCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.taskCard, 
        isCompleted && styles.completedCard,
        isPending && styles.pendingCard
      ]} 
      onPress={onPress}
      disabled={isCompleted || isPending}
    >
      <View style={styles.taskInfo}>
        <View style={[styles.iconContainer, isCompleted && styles.completedIcon]}>
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : icon} 
            size={24} 
            color={isCompleted ? "#10B981" : iconColor} 
          />
        </View>
        <View style={styles.taskDetails}>
          <ThemedText style={[styles.taskTitle, isCompleted && styles.completedText]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.taskDescription, isCompleted && styles.completedDescription]}>
            {description}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.taskReward}>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color="#10B981" />
            <ThemedText style={styles.completedText}>Done</ThemedText>
          </View>
        ) : isPending ? (
          <View style={styles.pendingBadge}>
            <Ionicons name="time" size={16} color="#F59E0B" />
            <ThemedText style={styles.pendingText}>Pending</ThemedText>
          </View>
        ) : (
          <View style={styles.rewardContainer}>
            <ThemedText style={styles.rewardAmount}>+{reward}</ThemedText>
            <Ionicons name="star" size={16} color="#FFD700" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  completedIcon: {
    transform: [{ scale: 1.1 }],
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  completedText: {
    color: '#10B981',
  },
  completedDescription: {
    color: '#059669',
  },
  taskReward: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardAmount: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pendingText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
});