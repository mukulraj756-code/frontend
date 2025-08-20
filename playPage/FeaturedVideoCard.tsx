import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';
import { FeaturedVideoCardProps, PLAY_PAGE_COLORS } from '@/types/playPage.types';

const { width: screenWidth } = Dimensions.get('window');

export default function FeaturedVideoCard({ 
  item, 
  onPress, 
  onLike,
  onShare,
  autoPlay = true 
}: FeaturedVideoCardProps) {
  const videoRef = useRef<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          if (autoPlay && isPlaying) {
            // iOS requires specific configuration for auto-play
            await videoRef.current.setStatusAsync({
              shouldPlay: true,
              isLooping: true,
              isMuted: true, // Required for iOS auto-play
              volume: 0, // Ensure muted
            });
          } else {
            await videoRef.current.setStatusAsync({
              shouldPlay: false,
            });
          }
        } catch (error) {
          console.warn('Featured video playback error:', error);
          setHasError(true);
        }
      }
    };
    
    playVideo();
  }, [autoPlay, isPlaying]);

  const handleVideoLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      if (autoPlay) {
        setIsPlaying(true);
      }
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleCardPress = () => {
    onPress(item);
  };

  const handleLikePress = (e: any) => {
    e.stopPropagation();
    onLike?.(item.id);
  };

  const handleSharePress = (e: any) => {
    e.stopPropagation();
    onShare?.(item);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      <View style={styles.videoContainer}>
        {!hasError ? (
          <Video
            ref={videoRef}
            source={{ uri: item.videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            isLooping={true}
            shouldPlay={isPlaying && autoPlay}
            isMuted={true} // Essential for iOS auto-play
            volume={0} // Ensure completely muted
            useNativeControls={false}
            onPlaybackStatusUpdate={handleVideoLoad}
            onError={handleVideoError}
            // iOS-specific optimizations
            posterSource={item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined}
            usePoster={!!item.thumbnailUrl}
            // Additional iOS settings for auto-play
            progressUpdateIntervalMillis={1000}
            positionMillis={0}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
            <Ionicons name="videocam-off" size={48} color="#666" />
            <ThemedText style={styles.errorText}>Video unavailable</ThemedText>
          </View>
        )}

        {/* Loading overlay */}
        {isLoading && !hasError && (
          <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="reload" size={32} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
          style={[StyleSheet.absoluteFill]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Top overlay with view count */}
        <View style={styles.topOverlay}>
          <View style={styles.viewCountContainer}>
            <Ionicons name="eye" size={14} color="#FFFFFF" />
            <ThemedText style={styles.viewCountText}>
              {item.viewCount}
            </ThemedText>
          </View>
        </View>

        {/* Product count indicator */}
        {item.productCount && item.productCount > 0 && (
          <View style={styles.productCountContainer}>
            <View style={styles.productCountPill}>
              <Ionicons name="pricetag" size={14} color="#FFFFFF" />
              <ThemedText style={styles.productCountText}>
                {item.productCount} Product{item.productCount > 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Content overlay */}
        <View style={styles.contentOverlay}>
          {/* Description */}
          <ThemedText 
            style={styles.description} 
            numberOfLines={3}
          >
            {item.description}
          </ThemedText>

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {item.hashtags.slice(0, 3).map((hashtag, index) => (
                <View key={index} style={styles.hashtagPill}>
                  <ThemedText style={styles.hashtagText}>
                    {hashtag}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLikePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={item.isLiked ? PLAY_PAGE_COLORS.like : "#FFFFFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleSharePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Play indicator */}
        {!isLoading && !hasError && (
          <View style={styles.playIndicator}>
            <View style={[
              styles.playDot, 
              { backgroundColor: isPlaying ? '#10B981' : '#6B7280' }
            ]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 380, // Taller for better proportions
    width: screenWidth - 40, // More margin
    borderRadius: 24, // More rounded
    overflow: 'hidden',
    backgroundColor: PLAY_PAGE_COLORS.cardBackground,
    shadowColor: PLAY_PAGE_COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, // Softer shadow
    shadowRadius: 24,
    elevation: 16,
    marginHorizontal: 20, // More margin
    marginBottom: 32, // More bottom spacing
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24, // More padding
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // More subtle
    borderRadius: 20, // More rounded
    paddingHorizontal: 14,
    paddingVertical: 8, // More padding
    gap: 8,
    backdropFilter: 'blur(10px)', // Glass effect
  },
  viewCountText: {
    color: '#FFFFFF',
    fontSize: 14, // Slightly larger
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  productCountContainer: {
    position: 'absolute',
    top: 24, // More spacing
    right: 24,
  },
  productCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PLAY_PAGE_COLORS.primary,
    borderRadius: 20, // More rounded
    paddingHorizontal: 16,
    paddingVertical: 8, // More padding
    gap: 8,
    shadowColor: PLAY_PAGE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  productCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28, // More generous padding
  },
  description: {
    color: '#FFFFFF',
    fontSize: 18, // Larger for featured card
    fontWeight: '700', // Bolder
    lineHeight: 26, // Better line spacing
    marginBottom: 16, // More space below
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, // More space between hashtags
    marginBottom: 20, // More space below
  },
  hashtagPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // More subtle
    borderRadius: 18, // More rounded
    paddingHorizontal: 16,
    paddingVertical: 8, // More padding
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hashtagText: {
    color: '#FFFFFF',
    fontSize: 13, // Slightly larger
    fontWeight: '700', // Bolder
    letterSpacing: 0.3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 20, // More space between buttons
  },
  actionButton: {
    width: 52, // Larger touch target
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // More subtle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playIndicator: {
    position: 'absolute',
    bottom: 24, // More spacing
    left: 28,
  },
  playDot: {
    width: 12, // Slightly larger
    height: 12,
    borderRadius: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});