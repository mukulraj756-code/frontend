import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CashbackModalProps {
  visible: boolean;
  onClose: () => void;
  cashbackAmount?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CashbackModal({
  visible,
  onClose,
  cashbackAmount = 219.9,
}: CashbackModalProps) {
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const coin1Anim = useRef(new Animated.Value(0)).current;
  const coin2Anim = useRef(new Animated.Value(0)).current;
  const coin3Anim = useRef(new Animated.Value(0)).current;
  const coin4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          bounciness: 12,
          speed: 10,
          useNativeDriver: true,
        }),
      ]).start();
      startCoinAnimations();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const startCoinAnimations = () => {
    const createFloatingAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createFloatingAnimation(coin1Anim, 0),
      createFloatingAnimation(coin2Anim, 400),
      createFloatingAnimation(coin3Anim, 800),
      createFloatingAnimation(coin4Anim, 1200),
    ]).start();
  };

  const renderFloatingCoin = (animValue: Animated.Value, style: object) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -25],
    });

    const rotate = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.coin,
          style,
          {
            transform: [{ translateY }, { rotate }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFD93D', '#FCA311']}
          style={styles.coinGradient}
        >
          <Text style={styles.coinText}>₹</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderGiftBox = () => (
    <Animated.View style={{ transform: [{ scale: fadeAnim }] }}>
      <View style={styles.giftBoxContainer}>
        <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.giftBoxBase} />
        <LinearGradient colors={['#F97316', '#EC4899']} style={styles.giftBoxTop} />
        <LinearGradient colors={['#FFD93D', '#FCA311']} style={styles.ribbonVertical} />
        <LinearGradient colors={['#FFD93D', '#FCA311']} style={styles.ribbonHorizontal} />
        <View style={styles.bow}>
          <LinearGradient colors={['#FFD93D', '#FCA311']} style={styles.bowLeft} />
          <LinearGradient colors={['#FFD93D', '#FCA311']} style={styles.bowRight} />
          <LinearGradient colors={['#FFD93D', '#FCA311']} style={styles.bowCenter} />
        </View>
        <View style={styles.giftBoxShadow} />
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.titleGradient}>
                <Text style={styles.titleText}>10%</Text>
              </LinearGradient>
              <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.cashGradient}>
                <Text style={styles.cashText}>CASH</Text>
              </LinearGradient>
              <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.backGradient}>
                <Text style={styles.backText}>Back</Text>
              </LinearGradient>
            </View>

            <Text style={styles.subtitle}>You have earned</Text>

            <View style={styles.celebrationContainer}>
              {renderFloatingCoin(coin1Anim, styles.coin1Position)}
              {renderFloatingCoin(coin2Anim, styles.coin2Position)}
              {renderFloatingCoin(coin3Anim, styles.coin3Position)}
              {renderFloatingCoin(coin4Anim, styles.coin4Position)}
              {renderGiftBox()}
            </View>

            <Text style={styles.amount}>₹{cashbackAmount.toFixed(2)}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 9,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    paddingTop: 22,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGradient: {
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 8,
    marginBottom: -5,
    zIndex: 3,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cashGradient: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: -5,
    zIndex: 2,
  },
  cashText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backGradient: {
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 6,
    zIndex: 1,
  },
  backText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 28,
    fontWeight: '500',
  },
  celebrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  giftBoxContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftBoxBase: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  giftBoxTop: {
    position: 'absolute',
    top: -8,
    width: 88,
    height: 20,
    borderRadius: 8,
  },
  ribbonVertical: {
    position: 'absolute',
    top: -8,
    width: 8,
    height: 68,
    left: 36,
  },
  ribbonHorizontal: {
    position: 'absolute',
    top: 22,
    width: 88,
    height: 8,
  },
  bow: {
    position: 'absolute',
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bowLeft: {
    position: 'absolute',
    width: 16,
    height: 12,
    borderRadius: 8,
    left: -8,
  },
  bowRight: {
    position: 'absolute',
    width: 16,
    height: 12,
    borderRadius: 8,
    right: -8,
  },
  bowCenter: {
    width: 6,
    height: 8,
    borderRadius: 3,
  },
  giftBoxShadow: {
    position: 'absolute',
    bottom: -20,
    width: 100,
    height: 15,
    backgroundColor: '#8B5CF6',
    borderRadius: 50,
    opacity: 0.25,
    transform: [{ scaleY: 0.3 }],
  },
  coin: {
    position: 'absolute',
    width: 34,
    height: 34,
  },
  coinGradient: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD93D',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coin1Position: { top: 40, left: 20 },
  coin2Position: { top: 30, right: 20 },
  coin3Position: { bottom: 60, left: 30 },
  coin4Position: { bottom: 50, right: 30 },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
    textAlign: 'center',
  },
});
