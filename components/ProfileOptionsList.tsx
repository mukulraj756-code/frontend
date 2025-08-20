// components/ProfileOptionsList.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProfileOption, ProfileOptionsListProps } from "@/types/profile";

// Dummy data (Replace with backend data later)
const defaultOptionsData: ProfileOption[] = [
  {
    id: "1",
    icon: "wallet-outline",
    title: "Wallet",
    subtitle: "Complete milestones and tasks for the exciting rewards",
    rightLabel: "₹2,075",
    badgeColor: "#38C172",
  },
  {
    id: "2",
    icon: "receipt-outline",
    title: "Order History",
    subtitle: "View order details",
  },
  {
    id: "3",
    icon: "heart-outline",
    title: "Wishlist",
    subtitle: "All your Favorites",
  },
  {
    id: "4",
    icon: "location-outline",
    title: "Saved address",
    subtitle: "Edit, add, delete your address",
  },
  {
    id: "5",
    icon: "resize-outline",
    title: "Ring Sizer",
    subtitle: "Check your ring size",
  },
];

const ProfileOptionsList: React.FC<ProfileOptionsListProps> = ({
  options = defaultOptionsData,
  onOptionPress,
  isLoading = false
}) => {
  const renderItem = ({ item }: { item: ProfileOption }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, item.disabled && styles.disabledItem]} 
      activeOpacity={0.7}
      onPress={() => {
        if (!item.disabled) {
          if (item.onPress) {
            item.onPress();
          } else if (onOptionPress) {
            onOptionPress(item);
          }
        }
      }}
      disabled={item.disabled}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={item.icon as keyof typeof Ionicons.glyphMap} 
          size={22} 
          color={item.disabled ? "#999" : "#7B3EFF"} 
        />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, item.disabled && styles.disabledText]}>{item.title}</Text>
          {item.rightLabel && (
            <View style={[styles.badge, { backgroundColor: item.badgeColor || "#38C172" }]}>
              <Text style={styles.badgeText}>{item.rightLabel}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, item.disabled && styles.disabledText]}>{item.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={item.disabled ? "#CCC" : "#999"} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading options...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
    
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C2C2C",
    marginRight: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#38C172",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledItem: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#999",
  },
  loadingText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    padding: 20,
  },
});

export default ProfileOptionsList;
