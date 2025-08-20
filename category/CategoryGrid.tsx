import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import CategoryCard from './CategoryCard';
import { CategoryItem, CategoryLayoutConfig } from '@/types/category.types';

interface CategoryGridProps {
  items: CategoryItem[];
  layoutConfig: CategoryLayoutConfig;
  onItemPress: (item: CategoryItem) => void;
  onAddToCart: (item: CategoryItem) => void;
  onToggleFavorite: (item: CategoryItem) => void;
  loading?: boolean;
  horizontal?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function CategoryGrid({
  items,
  layoutConfig,
  onItemPress,
  onAddToCart,
  onToggleFavorite,
  loading = false,
  horizontal = false,
  onLoadMore,
  hasMore = false,
  refreshing = false,
  onRefresh,
}: CategoryGridProps) {
  const { width } = Dimensions.get('window');
  
  // Calculate item width based on layout configuration
  const getItemWidth = () => {
    const padding = 16; // Container padding
    const spacing = layoutConfig.spacing || 12;
    const itemsPerRow = layoutConfig.itemsPerRow || 2;
    
    if (horizontal) {
      return width * 0.7; // 70% of screen width for horizontal items
    }
    
    if (layoutConfig.type === 'list') {
      return width - (padding * 2);
    }
    
    return (width - (padding * 2) - (spacing * (itemsPerRow - 1))) / itemsPerRow;
  };

  const itemWidth = getItemWidth();

  // Determine card layout type based on configuration
  const getCardLayoutType = (): 'compact' | 'detailed' | 'featured' => {
    switch (layoutConfig.type) {
      case 'featured':
        return 'featured';
      case 'list':
        return 'detailed';
      case 'cards':
      case 'grid':
      default:
        return 'compact';
    }
  };

  const cardLayoutType = getCardLayoutType();

  // Render individual item
  const renderItem = ({ item, index }: { item: CategoryItem; index: number }) => {
    const isLastRow = horizontal ? false : index >= items.length - (layoutConfig.itemsPerRow || 2);
    
    return (
      <View style={[
        styles.itemContainer,
        {
          width: itemWidth,
          marginRight: horizontal ? (layoutConfig.spacing || 12) : 0,
          marginBottom: isLastRow ? 0 : (layoutConfig.spacing || 12),
        }
      ]}>
        <CategoryCard
          item={item}
          layoutType={cardLayoutType}
          onPress={onItemPress}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          showQuickActions={layoutConfig.showQuickActions}
          cardStyle={layoutConfig.cardStyle}
        />
      </View>
    );
  };

  // Render loading footer for pagination
  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading more...</ThemedText>
      </View>
    );
  };

  // Handle end reached for pagination
  const handleEndReached = () => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  // Get key extractor
  const keyExtractor = (item: CategoryItem) => item.id;

  // Get number of columns for grid layout
  const getNumColumns = () => {
    if (horizontal || layoutConfig.type === 'list') return 1;
    return layoutConfig.itemsPerRow || 2;
  };

  // Container style based on layout type
  const getContainerStyle = () => {
    if (horizontal) {
      return [styles.container, styles.horizontalContainer];
    }
    
    if (layoutConfig.type === 'list') {
      return [styles.container, styles.listContainer];
    }
    
    return [styles.container, styles.gridContainer];
  };

  return (
    <View style={getContainerStyle()}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={getNumColumns()}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          horizontal && styles.horizontalContent,
          items.length === 0 && styles.emptyContent,
        ]}
        ItemSeparatorComponent={
          layoutConfig.type === 'list' && !horizontal ? 
            () => <View style={styles.listSeparator} /> : 
            undefined
        }
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          ) : undefined
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={10}
        getItemLayout={
          layoutConfig.type === 'list' ? (data, index) => ({
            length: 120, // Estimated item height for list items
            offset: 120 * index,
            index,
          }) : undefined
        }
      />
      
      {/* Loading overlay for initial load */}
      {loading && items.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingOverlayText}>Loading items...</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  horizontalContainer: {
    paddingLeft: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  horizontalContent: {
    paddingRight: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  itemContainer: {
    // Dynamic styles applied inline
  },
  listSeparator: {
    height: 12,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingOverlayText: {
    fontSize: 16,
    color: '#6B7280',
  },
});