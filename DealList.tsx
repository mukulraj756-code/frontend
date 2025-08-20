import React, { useState, useCallback, useMemo, useRef,useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Deal, DealCategory } from '@/types/deals';
import DealCard from '@/components/DealCard';
import DealCardSkeleton from '@/components/DealCardSkeleton';

export type SortOption = 'priority' | 'discount' | 'expiry' | 'alphabetical';
export type FilterOption = 'all' | DealCategory;

interface DealListProps {
  deals: Deal[];
  selectedDeals: string[];
  onAddDeal: (dealId: string) => void;
  onRemoveDeal: (dealId: string) => void;
  onMoreDetails: (dealId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  showFilters?: boolean;
}

interface DealListItemData {
  deal: Deal;
  isSelected: boolean;
}

export default function DealList({
  deals,
  selectedDeals,
  onAddDeal,
  onRemoveDeal,
  onMoreDetails,
  isLoading = false,
  onRefresh,
  showFilters = true,
}: DealListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const isTablet = screenData.width > 768;
  const numColumns = isTablet ? 2 : 1;
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update screen data on orientation change with debouncing
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce the screen data update to prevent blur during resize
      resizeTimeoutRef.current = setTimeout(() => {
        setScreenData(window);
      }, 100); // 100ms debounce
    });

    return () => {
      subscription?.remove();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Memoized filtered and sorted deals
  const processedDeals = useMemo(() => {
    let filteredDeals = deals.filter(deal => {
      if (filterBy === 'all') return true;
      return deal.category === filterBy;
    });

    // Sort deals based on selected option
    filteredDeals.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return a.priority - b.priority;
        case 'discount':
          return b.discountValue - a.discountValue;
        case 'expiry':
          return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return a.priority - b.priority;
      }
    });

    return filteredDeals.map(deal => ({
      deal,
      isSelected: selectedDeals.includes(deal.id),
    }));
  }, [deals, selectedDeals, sortBy, filterBy]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh]);

  // Render individual deal card
  const renderDealItem = useCallback(({ item, index }: { item: DealListItemData; index: number }) => {
    return (
      <View style={[
        styles.dealItemContainer,
        isTablet && styles.dealItemTablet,
        isTablet && index % 2 === 0 && styles.dealItemLeft,
        isTablet && index % 2 === 1 && styles.dealItemRight,
      ]}>
        <DealCard
          deal={item.deal}
          onAdd={onAddDeal}
          onRemove={onRemoveDeal}
          isAdded={item.isSelected}
          onMoreDetails={onMoreDetails}
        />
      </View>
    );
  }, [onAddDeal, onRemoveDeal, onMoreDetails, isTablet]);

  // Render loading skeleton
  const renderSkeletonItem = useCallback(({ index }: { index: number }) => (
    <View style={[
      styles.dealItemContainer,
      isTablet && styles.dealItemTablet,
      isTablet && index % 2 === 0 && styles.dealItemLeft,
      isTablet && index % 2 === 1 && styles.dealItemRight,
    ]}>
      <DealCardSkeleton />
    </View>
  ), [isTablet]);

  // Render empty state
  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={filterBy === 'all' ? "gift-outline" : "funnel-outline"} 
        size={48} 
        color="#D1D5DB" 
      />
      <ThemedText style={styles.emptyTitle}>
        {filterBy === 'all' ? 'No deals available' : 'No deals match your filter'}
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {filterBy === 'all' 
          ? 'Check back later for exciting offers!' 
          : 'Try adjusting your filter criteria'
        }
      </ThemedText>
      {filterBy !== 'all' && (
        <TouchableOpacity 
          style={styles.clearFilterButton}
          onPress={() => setFilterBy('all')}
        >
          <ThemedText style={styles.clearFilterText}>Clear Filter</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  ), [filterBy]);

  // Render header with filters and sorting
  const renderHeader = useCallback(() => {
    if (!showFilters) return null;

    return (
      <View style={styles.header}>
        {/* Summary */}
        <View style={styles.summaryContainer}>
          <ThemedText style={styles.summaryText}>
            {processedDeals.length} deal{processedDeals.length !== 1 ? 's' : ''} available
          </ThemedText>
          {selectedDeals.length > 0 && (
            <View style={styles.selectedSummary}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <ThemedText style={styles.selectedText}>
                {selectedDeals.length} selected
              </ThemedText>
            </View>
          )}
        </View>

        {/* Filter and Sort Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="funnel-outline" size={16} color="#8B5CF6" />
            <ThemedText style={styles.controlButtonText} numberOfLines={1}>
              {filterBy === 'all' ? 'Filter' : `Filter: ${getCategoryDisplayName(filterBy)}`}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              const nextSort: SortOption = 
                sortBy === 'priority' ? 'discount' :
                sortBy === 'discount' ? 'expiry' :
                sortBy === 'expiry' ? 'alphabetical' : 'priority';
              setSortBy(nextSort);
            }}
          >
            <Ionicons name="swap-vertical-outline" size={16} color="#8B5CF6" />
            <ThemedText style={styles.controlButtonText} numberOfLines={1}>
              Sort: {getSortDisplayName(sortBy)}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <View style={styles.quickFiltersContainer}>
          <TouchableOpacity
            style={[styles.quickFilter, filterBy === 'all' && styles.quickFilterActive]}
            onPress={() => setFilterBy('all')}
          >
            <ThemedText 
              style={[
                styles.quickFilterText,
                filterBy === 'all' && styles.quickFilterTextActive
              ]}
              numberOfLines={1}
            >
              All
            </ThemedText>
          </TouchableOpacity>
          
          {getPopularCategories().map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.quickFilter, filterBy === category && styles.quickFilterActive]}
              onPress={() => setFilterBy(category)}
            >
              <ThemedText 
                style={[
                  styles.quickFilterText,
                  filterBy === category && styles.quickFilterTextActive
                ]}
                numberOfLines={1}
              >
                {getCategoryDisplayName(category)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [showFilters, processedDeals.length, selectedDeals.length, filterBy, sortBy]);

  // Create responsive styles
  const styles = useMemo(() => createStyles(screenData, isTablet), [screenData, isTablet]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: DealListItemData) => item.deal.id, []);

  // Get item layout for performance
  const getItemLayout = useCallback((data: any, index: number) => {
    const ITEM_HEIGHT = 400; // Approximate height of deal card
    return {
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    };
  }, []);

  if (isLoading && processedDeals.length === 0) {
    // Show skeleton loading for initial load
    return (
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={Array(3).fill(null)}
          renderItem={renderSkeletonItem}
          keyExtractor={(_, index) => `skeleton-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          numColumns={numColumns}
          key={numColumns} // Force re-render when columns change
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={processedDeals}
        renderItem={renderDealItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
              colors={['#8B5CF6']}
            />
          ) : undefined
        }
        numColumns={numColumns}
        key={numColumns} // Force re-render when orientation changes
        getItemLayout={processedDeals.length > 20 ? getItemLayout : undefined}
        removeClippedSubviews={processedDeals.length > 10}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        updateCellsBatchingPeriod={100}
      />

      {/* Loading overlay for refresh */}
      {isLoading && processedDeals.length > 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}
    </View>
  );
}

// Helper functions
const getCategoryDisplayName = (category: string): string => {
  const names: Record<string, string> = {
    'instant-discount': 'Instant',
    'cashback': 'Cashback',
    'buy-one-get-one': 'BOGO',
    'seasonal': 'Seasonal',
    'first-time': 'New User',
    'loyalty': 'VIP',
    'clearance': 'Clearance',
  };
  return names[category] || category;
};

const getSortDisplayName = (sort: SortOption): string => {
  const names: Record<SortOption, string> = {
    priority: 'Priority',
    discount: 'Discount',
    expiry: 'Expiry',
    alphabetical: 'A-Z',
  };
  return names[sort];
};

const getPopularCategories = (): DealCategory[] => {
  return ['instant-discount', 'cashback', 'buy-one-get-one', 'loyalty'];
};

const createStyles = (screenData: { width: number; height: number }, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: screenData.width < 375 ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: screenData.width < 375 ? 12 : 16,
    paddingHorizontal: screenData.width < 375 ? 12 : 16,
    paddingTop: 8,
  },
  summaryContainer: {
    flexDirection: screenData.width < 414 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: screenData.width < 414 ? 'flex-start' : 'center',
    marginBottom: screenData.width < 375 ? 12 : 16,
    gap: screenData.width < 414 ? 8 : 12,
    minHeight: screenData.width < 414 ? 'auto' : 44,
  },
  summaryText: {
    fontSize: screenData.width < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#374151',
    flex: screenData.width < 414 ? 1 : 0,
  },
  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 4,
  },
  controlsContainer: {
    flexDirection: screenData.width < 414 ? 'column' : 'row',
    marginBottom: screenData.width < 375 ? 12 : 16,
    gap: screenData.width < 375 ? 8 : 12,
    alignItems: screenData.width < 414 ? 'stretch' : 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: screenData.width < 375 ? 10 : 12,
    paddingVertical: screenData.width < 375 ? 8 : 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: screenData.width < 414 ? 1 : 0,
    justifyContent: 'center',
    minHeight: 44, // Ensure minimum touch target
    minWidth: screenData.width < 414 ? 'auto' : 120,
  },
  controlButtonText: {
    fontSize: screenData.width < 375 ? 12 : 14,
    fontWeight: '500',
    color: '#8B5CF6',
    marginLeft: 6,
    textAlign: 'center',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: screenData.width < 375 ? 6 : 8,
    marginTop: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  quickFilter: {
    backgroundColor: '#F1F5F9',
    borderRadius: screenData.width < 375 ? 12 : 16,
    paddingHorizontal: screenData.width < 375 ? 8 : 12,
    paddingVertical: screenData.width < 375 ? 4 : 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: screenData.width < 375 ? screenData.width * 0.25 : screenData.width * 0.3,
  },
  quickFilterActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  quickFilterText: {
    fontSize: screenData.width < 375 ? 10 : 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  quickFilterTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 24,
    paddingHorizontal: screenData.width < 375 ? 4 : 8, // Reduced since cards have more margin now
    flexGrow: 1,
  },
  dealItemContainer: {
    marginBottom: 0, // DealCard has its own margin
    paddingHorizontal: 0, // Removed padding since cards have increased margins
  },
  dealItemTablet: {
    flex: 1,
  },
  dealItemLeft: {
    marginRight: isTablet ? 12 : 8,
  },
  dealItemRight: {
    marginLeft: isTablet ? 12 : 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  clearFilterButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});