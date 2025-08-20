// components/ScratchCardOffer.tsx
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { ScratchCardOfferProps } from "@/types/profile";

const ScratchCardOffer: React.FC<ScratchCardOfferProps> = ({ 
  imageSource, 
  onPress, 
  title,
  description,
  isActive = true 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, !isActive && styles.inactiveContainer]} 
      onPress={isActive ? onPress : undefined} 
      activeOpacity={isActive ? 0.85 : 1}
      disabled={!isActive}
    >
      <Image 
        source={imageSource} 
        style={[styles.image, !isActive && styles.inactiveImage]} 
        resizeMode="cover" 
      />
      {(title || description) && (
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      )}
      {!isActive && (
        <View style={styles.overlay}>
          <Text style={styles.inactiveText}>Expired</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    aspectRatio: 5.5, // keep similar proportion to your screenshot
    marginVertical: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  inactiveImage: {
    opacity: 0.5,
  },
  textContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 8,
  },
  title: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  inactiveText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScratchCardOffer;
