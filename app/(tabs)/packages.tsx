import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import Header from "@/components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { Package, PACKAGES } from "@/interfaces/package.interface";
import { useUserStore } from '../../store/useUserStore';

export default function PackagesScreen() {
  const { subscription } = useUserStore();
  const currentPackage = subscription ? PACKAGES.find(p => p.id === subscription.packageId) : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderCurrentSubscription = () => {
    if (!subscription || !currentPackage) return null;

    return (
      <View style={styles.currentPackageContainer}>
        <View style={styles.currentPackageHeader}>
          <Text style={styles.currentPackageTitle}>Current Subscription</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: subscription.status === 'active' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.currentPackageContent}>
          <Text style={styles.packageName}>{currentPackage.name} Package</Text>
          <Text style={styles.expiryDate}>
            Expires: {formatDate(subscription.endDate)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPackagePrice = (item: Package) => {
    if (item.isCustom) {
      return (
        <Text style={styles.packagePrice}>
          Contact Admin
        </Text>
      );
    }
    
    return (
      <Text style={styles.packagePrice}>
        {item.price === 0 ? 'Free' : 
          new Intl.NumberFormat("en-US", { 
            style: "currency", 
            currency: "USD" 
          }).format(item.price || 0)}
        <Text style={styles.duration}>/{item.duration}</Text>
      </Text>
    );
  };

  const renderPackage = ({ item }: { item: Package }) => (
    <View style={[styles.packageCard, item.recommended && styles.recommendedCard]}>
      {item.recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}
      <Text style={styles.packageName}>{item.name}</Text>
      {renderPackagePrice(item)}

      <View style={styles.featuresContainer}>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.buyButton, item.recommended && styles.recommendedButton]}>
        <Text style={styles.buyButtonText}>Choose Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      <Header title="Packages" />
      {renderCurrentSubscription()}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={PACKAGES}
        renderItem={renderPackage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  packageCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedCard: {
    borderColor: "#0a7ea4",
    borderWidth: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  packageName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0a7ea4",
    marginBottom: 16,
  },
  duration: {
    fontSize: 16,
    color: "#666",
    fontWeight: "normal",
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  buyButton: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  recommendedButton: {
    backgroundColor: "#0a7ea4",
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  currentPackageContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentPackageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPackageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  currentPackageContent: {
    gap: 8,
  },
  expiryDate: {
    fontSize: 14,
    color: '#666',
  },
});
