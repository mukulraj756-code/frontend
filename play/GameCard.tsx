import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface GameCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  reward: string;
  onPress: () => void;
  isLocked?: boolean;
}

export default function GameCard({ 
  title, 
  description, 
  icon, 
  iconColor, 
  reward, 
  onPress,
  isLocked = false
}: GameCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.gameCard, isLocked && styles.lockedCard]} 
      onPress={onPress}
      disabled={isLocked}
    >
      <View style={styles.gameIcon}>
        <Ionicons name={icon} size={32} color={isLocked ? '#CBD5E1' : iconColor} />
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={16} color="#64748B" />
          </View>
        )}
      </View>
      <ThemedText style={[styles.gameTitle, isLocked && styles.lockedText]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.gameDescription, isLocked && styles.lockedText]}>
        {description}
      </ThemedText>
      <View style={[styles.rewardBadge, isLocked && styles.lockedBadge]}>
        <ThemedText style={[styles.rewardText, isLocked && styles.lockedRewardText]}>
          {isLocked ? 'Locked' : reward}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gameCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  lockedCard: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  rewardBadge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lockedBadge: {
    backgroundColor: '#E2E8F0',
  },
  rewardText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  lockedText: {
    color: '#94A3B8',
  },
  lockedRewardText: {
    color: '#64748B',
  },
});