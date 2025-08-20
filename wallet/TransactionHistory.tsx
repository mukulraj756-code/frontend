// Transaction History Component
// Complete transaction history section with filtering and pagination

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import TransactionTabs from './TransactionTabs';
import TransactionCard from './TransactionCard';
import { 
  Transaction, 
  TransactionCategory, 
  WalletTab 
} from '@/types/wallet.types';
import { 
  fetchTransactions, 
  walletTabs as defaultTabs 
} from '@/data/walletData';

interface TransactionHistoryProps {
  onTransactionPress?: (transaction: Transaction) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxHeight?: number;
}

export default function TransactionHistory({ 
  onTransactionPress, 
  refreshing = false, 
  onRefresh,
  maxHeight,
}: TransactionHistoryProps) {
  const [activeTab, setActiveTab] = useState<TransactionCategory>('ALL');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tabs, setTabs] = useState<WalletTab[]>(defaultTabs);

  // Load transactions for the current tab
  const loadTransactions = async (
    category: TransactionCategory = activeTab, 
    page: number = 1, 
    append: boolean = false
  ) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await fetchTransactions(category, page, 20);
      
      if (append) {
        setTransactions(prev => [...prev, ...result.transactions]);
      } else {
        setTransactions(result.transactions);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Update tabs with current transaction counts
  const updateTabCounts = async () => {
    try {
      const updatedTabs = await Promise.all(
        defaultTabs.map(async (tab) => {
          const result = await fetchTransactions(tab.id, 1, 1000); // Get all for counting
          return {
            ...tab,
            count: result.total,
            isActive: tab.id === activeTab,
          };
        })
      );
      setTabs(updatedTabs);
    } catch (error) {
      console.error('Error updating tab counts:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadTransactions(activeTab, 1, false);
    updateTabCounts();
  }, [activeTab]);

  // Handle tab change
  const handleTabPress = (tabId: TransactionCategory) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      setCurrentPage(1);
      setHasMore(true);
      
      // Update active state in tabs
      setTabs(prev => 
        prev.map(tab => ({ 
          ...tab, 
          isActive: tab.id === tabId 
        }))
      );
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      loadTransactions(activeTab, currentPage + 1, true);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    onRefresh?.();
    setCurrentPage(1);
    setHasMore(true);
    loadTransactions(activeTab, 1, false);
    updateTabCounts();
  };

  // Render transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard 
      transaction={item} 
      onPress={onTransactionPress}
      showDate={true}
    />
  );

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading more transactions...</ThemedText>
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>No transactions found</ThemedText>
      <ThemedText style={styles.emptyDescription}>
        No transactions available for the selected category.
      </ThemedText>
    </View>
  );

  // Loading state
  if (isLoading && transactions.length === 0) {
    return (
      <View style={styles.container}>
        <TransactionTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={handleTabPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading transactions...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, maxHeight && { maxHeight }]}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Transaction History</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {/* Filter Tabs */}
      <TransactionTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
            colors={['#8B5CF6']}
            progressBackgroundColor="#FFFFFF"
          />
        }
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.emptyListContent,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // List
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});