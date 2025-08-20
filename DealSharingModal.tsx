import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Deal } from '@/types/deals';

interface DealSharingModalProps {
  visible: boolean;
  onClose: () => void;
  deal: Deal | null;
  storeName?: string;
}

interface SharingOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: (deal: Deal, storeName: string) => void;
}

export default function DealSharingModal({
  visible,
  onClose,
  deal,
  storeName = 'Store',
}: DealSharingModalProps) {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(screenData.height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
      slideAnim.setValue(window.height);
    });

    return () => subscription?.remove();
  }, [slideAnim]);

  const styles = createStyles(screenData);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenData.height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Copy feedback animation
  useEffect(() => {
    if (copyFeedback) {
      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCopyFeedback(false);
      });
    }
  }, [copyFeedback, feedbackAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleModalPress = (event: any) => {
    event.stopPropagation();
  };

  // Generate shareable content
  const generateShareContent = (deal: Deal, storeName: string) => {
    const expiryDate = deal.validUntil.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const message = `🎉 Amazing Deal Alert! 🎉

${deal.title}
💰 Save ${deal.discountValue}%
🏪 At ${storeName}
💳 Minimum bill: ₹${deal.minimumBill.toLocaleString()}
⏰ Valid until: ${expiryDate}

${deal.description || 'Don\'t miss out on this incredible offer!'}

#Deals #Savings #${storeName.replace(/\s+/g, '')}`;

    const url = `https://store.app/deals/${deal.id}`;
    
    return { message, url };
  };

  // Sharing options
  const sharingOptions: SharingOption[] = [
    {
      id: 'native',
      name: 'Share',
      icon: 'share-outline',
      color: '#8B5CF6',
      action: async (deal: Deal, storeName: string) => {
        try {
          const { message, url } = generateShareContent(deal, storeName);
          await Share.share({
            message: `${message}\n\n${url}`,
            url,
            title: deal.title,
          });
        } catch (error) {
          console.error('Error sharing deal:', error);
          Alert.alert('Error', 'Failed to share deal. Please try again.');
        }
      },
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: 'copy-outline',
      color: '#10B981',
      action: async (deal: Deal, storeName: string) => {
        try {
          const { message, url } = generateShareContent(deal, storeName);
          const shareText = `${message}\n\n${url}`;
          await Clipboard.setString(shareText);
          setCopyFeedback(true);
        } catch (error) {
          console.error('Error copying to clipboard:', error);
          Alert.alert('Error', 'Failed to copy link. Please try again.');
        }
      },
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: async (deal: Deal, storeName: string) => {
        try {
          const { message } = generateShareContent(deal, storeName);
          // In a real app, you might use a WhatsApp URL scheme or external app
          await Share.share({
            message,
            title: `Share ${deal.title} on WhatsApp`,
          });
        } catch (error) {
          console.error('Error sharing to WhatsApp:', error);
          Alert.alert('Error', 'Failed to share to WhatsApp. Please try again.');
        }
      },
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: 'chatbubble-outline',
      color: '#3B82F6',
      action: async (deal: Deal, storeName: string) => {
        try {
          const { message } = generateShareContent(deal, storeName);
          // In a real app, you might use SMS URL scheme
          await Share.share({
            message,
            title: `Share ${deal.title} via SMS`,
          });
        } catch (error) {
          console.error('Error sharing via SMS:', error);
          Alert.alert('Error', 'Failed to share via SMS. Please try again.');
        }
      },
    },
  ];

  if (!deal) return null;

  const handleShareOption = (option: SharingOption) => {
    option.action(deal, storeName);
    if (option.id !== 'copy') {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView intensity={50} style={styles.blur} />
          </Animated.View>

          <TouchableWithoutFeedback onPress={handleModalPress}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={20} color="#555" />
                  </TouchableOpacity>
                  
                  <ThemedText style={styles.title}>Share Deal</ThemedText>
                  <ThemedText style={styles.subtitle}>Spread the savings with friends!</ThemedText>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                  {/* Deal Preview */}
                  <View style={styles.dealPreview}>
                    <View style={styles.dealBadge}>
                      <ThemedText style={styles.dealBadgeText}>
                        {deal.badge?.text || `Save ${deal.discountValue}%`}
                      </ThemedText>
                    </View>
                    
                    <ThemedText style={styles.dealTitle}>{deal.title}</ThemedText>
                    
                    {deal.description && (
                      <ThemedText style={styles.dealDescription}>{deal.description}</ThemedText>
                    )}
                    
                    <View style={styles.dealDetails}>
                      <View style={styles.dealDetailRow}>
                        <Ionicons name="storefront-outline" size={16} color="#8B5CF6" />
                        <ThemedText style={styles.dealDetailText}>Available at {storeName}</ThemedText>
                      </View>
                      
                      <View style={styles.dealDetailRow}>
                        <Ionicons name="wallet-outline" size={16} color="#8B5CF6" />
                        <ThemedText style={styles.dealDetailText}>
                          Minimum bill: ₹{deal.minimumBill.toLocaleString()}
                        </ThemedText>
                      </View>
                      
                      <View style={styles.dealDetailRow}>
                        <Ionicons name="time-outline" size={16} color="#8B5CF6" />
                        <ThemedText style={styles.dealDetailText}>
                          Valid until: {deal.validUntil.toLocaleDateString('en-IN')}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  {/* Sharing Options */}
                  <View style={styles.sharingSection}>
                    <ThemedText style={styles.sectionTitle}>Choose how to share</ThemedText>
                    
                    <View style={styles.sharingGrid}>
                      {sharingOptions.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={styles.sharingOption}
                          onPress={() => handleShareOption(option)}
                        >
                          <View style={[styles.sharingIcon, { backgroundColor: option.color }]}>
                            <Ionicons name={option.icon as any} size={24} color="#fff" />
                          </View>
                          <ThemedText style={styles.sharingLabel}>{option.name}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Share Benefits */}
                  <View style={styles.benefitsSection}>
                    <ThemedText style={styles.sectionTitle}>Why share deals?</ThemedText>
                    
                    <View style={styles.benefitItem}>
                      <Ionicons name="people-outline" size={20} color="#10B981" />
                      <View style={styles.benefitContent}>
                        <ThemedText style={styles.benefitTitle}>Help friends save</ThemedText>
                        <ThemedText style={styles.benefitDescription}>
                          Share amazing deals with your friends and family
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.benefitItem}>
                      <Ionicons name="gift-outline" size={20} color="#F59E0B" />
                      <View style={styles.benefitContent}>
                        <ThemedText style={styles.benefitTitle}>Earn rewards</ThemedText>
                        <ThemedText style={styles.benefitDescription}>
                          Get bonus points when friends use your shared deals
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.benefitItem}>
                      <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
                      <View style={styles.benefitContent}>
                        <ThemedText style={styles.benefitTitle}>Unlock more deals</ThemedText>
                        <ThemedText style={styles.benefitDescription}>
                          Active sharers get access to exclusive offers
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>

          {/* Copy Feedback */}
          <Animated.View 
            style={[
              styles.copyFeedback,
              {
                opacity: feedbackAnim,
                transform: [{
                  translateY: feedbackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                }],
              }
            ]}
            pointerEvents="none"
          >
            <View style={styles.feedbackContent}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <ThemedText style={styles.feedbackText}>Deal link copied!</ThemedText>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (screenData: { width: number; height: number }) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    blurContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    blur: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: 20,
      width: '100%',
      maxHeight: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 6,
    },
    header: {
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: '#6B7280',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    dealPreview: {
      backgroundColor: '#F8FAFC',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      position: 'relative',
    },
    dealBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: '#8B5CF6',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    dealBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    dealTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 8,
      paddingRight: 80,
    },
    dealDescription: {
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 20,
      marginBottom: 16,
    },
    dealDetails: {
      gap: 8,
    },
    dealDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dealDetailText: {
      fontSize: 13,
      color: '#374151',
      marginLeft: 8,
    },
    sharingSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 16,
    },
    sharingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    sharingOption: {
      alignItems: 'center',
      width: '22%',
      minWidth: 70,
    },
    sharingIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    sharingLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: '#374151',
      textAlign: 'center',
    },
    benefitsSection: {
      marginBottom: 20,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    benefitContent: {
      flex: 1,
      marginLeft: 12,
    },
    benefitTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 2,
    },
    benefitDescription: {
      fontSize: 12,
      color: '#6B7280',
      lineHeight: 16,
    },
    copyFeedback: {
      position: 'absolute',
      bottom: 100,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    feedbackContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#065F46',
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    feedbackText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      marginLeft: 8,
    },
  });
};