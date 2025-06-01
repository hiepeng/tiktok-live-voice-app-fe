import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Package, SubscriptionType } from "@/interfaces/package.interface";
import PaymentService from "@/services/PaymentService";

export default function PackagesScreen() {
  const { currentSubscription, packages, isLoading, isPurchasing, error, fetchCurrentSubscription, fetchPackages } =
    useSubscriptionStore();

  const [iapInitialized, setIapInitialized] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription();
    fetchPackages();
    initializeIAP();
    PaymentService.getAvailableSubscriptions();

    // Cleanup khi component unmount
    return () => {
      PaymentService.cleanup();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      const initialized = await PaymentService.initializeIAP();
      setIapInitialized(initialized);
    } catch (error) {
      console.error("Failed to initialize IAP 1", error);
    }
  };

  const handlePurchase = (pkg: Package) => {
    if (pkg.type === SubscriptionType.FREE) {
      Alert.alert("Info", "Free plan is automatically activated when paid plans expire");
      return;
    }

    Alert.alert("Select Duration", "Choose your subscription period:", [
      {
        text: "1 Month",
        onPress: () => confirmPurchase(pkg, 1),
      },
      {
        text: "6 Months (10% off)",
        onPress: () => confirmPurchase(pkg, 6),
      },
      {
        text: "12 Months (20% off)",
        onPress: () => confirmPurchase(pkg, 12),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const confirmPurchase = async (pkg: Package, duration: 1 | 6 | 12) => {
    const price = pkg.price * duration * (duration === 1 ? 1 : duration === 6 ? 0.9 : 0.8);

    Alert.alert(
      "Confirm Subscription",
      `Subscribe to ${pkg.name} for ${duration} ${duration === 1 ? "month" : "months"}?\n\nTotal: $${price.toFixed(2)}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Subscribe",
          onPress: async () => {
            try {
              if (!iapInitialized) {
                throw new Error("Payment service not initialized");
              }

              // Fetch available subscriptions first
              const availableSubscriptions = await PaymentService.getAvailableSubscriptions();
              if (!availableSubscriptions || availableSubscriptions.length === 0) {
                throw new Error("No subscriptions available");
              }

              // Purchase subscription
              await PaymentService.purchaseSubscription(pkg.type, duration);
            } catch (error) {
              Alert.alert("Error", JSON.stringify(error));
              console.error("Subscription error:", error);
            }
          },
        },
      ],
    );
  };

  const handlePackageAction = (pkg: Package) => {
    if (pkg.type === SubscriptionType.CUSTOM) {
      Linking.openURL("https://tiktok-live-voice.com/enterprise");
      return;
    }
    handlePurchase(pkg);
  };

  const renderCurrentSubscription = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!currentSubscription) return null;

    return (
      <View style={styles.currentPackageContainer}>
        <View style={styles.currentPackageHeader}>
          <Text style={styles.currentPackageTitle}>Current Package</Text>
          {currentSubscription.type !== SubscriptionType.FREE && (
            <View style={[styles.statusBadge, { backgroundColor: "#4CAF50" }]}>
              <Text style={styles.statusText}>{"Active"}</Text>
            </View>
          )}
        </View>

        <View style={styles.currentPackageContent}>
          <Text style={styles.packageName}>{currentSubscription.name}</Text>
          {currentSubscription.type !== SubscriptionType.FREE && currentSubscription.endDate && (
            <Text style={styles.expiryDate}>Expires: {currentSubscription.endDate.toLocaleDateString()}</Text>
          )}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                {currentSubscription.maxDuration === -1
                  ? "Unlimited stream duration"
                  : `${currentSubscription.maxDuration} minutes per stream`}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                {`${currentSubscription.maxConcurrentStreams} concurrent ${
                  currentSubscription.maxConcurrentStreams > 1 ? "streams" : "stream"
                }`}
              </Text>
            </View>
            {currentSubscription.features?.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPackagePrice = (pkg: Package) => {
    if (pkg.type === SubscriptionType.CUSTOM) {
      return <Text style={styles.packagePrice}>Contact Us</Text>;
    }
    return (
      <Text style={styles.packagePrice}>
        {pkg.price === 0
          ? "Free"
          : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(pkg.price)}
        <Text style={styles.duration}>/month</Text>
      </Text>
    );
  };

  const renderPackage = ({ item, index }: { item: Package; index: number }) => (
    <View style={styles.packageCard}>
      <Text style={styles.packageName}>{item.name}</Text>
      {renderPackagePrice(item)}

      <View style={styles.featuresContainer}>
        {item.type !== SubscriptionType.CUSTOM && (
          <>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{item.maxDuration + " minutes per stream"}</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{item.maxConcurrentStreams + " concurrent stream"}</Text>
            </View>
          </>
        )}
        {item.features?.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.buyButton,
          item.type === SubscriptionType.CUSTOM && styles.customButton,
          currentSubscription?.type === item.type && styles.currentPlanButton,
          isPurchasing && styles.disabledButton,
        ]}
        onPress={() => handlePackageAction(item)}
        disabled={currentSubscription?.type === item.type || isPurchasing}
      >
        <Text
          style={[
            styles.buyButtonText,
            item.type === SubscriptionType.CUSTOM && styles.customButtonText,
            currentSubscription?.type === item.type && { color: "#fff" },
          ]}
        >
          {isPurchasing
            ? "Processing..."
            : item.type === SubscriptionType.CUSTOM
              ? "Contact Us"
              : currentSubscription?.type === item.type
                ? "Current Plan"
                : "Choose Plan"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Packages" />
      <FlatList
        data={[
          ...packages,
          {
            _id: "custom",
            name: "Enterprise",
            price: 0,
            maxDuration: 0,
            maxConcurrentStreams: 0,
            features: ["Custom features", "Dedicated support", "SLA guarantees"],
            type: SubscriptionType.CUSTOM,
          },
        ]}
        renderItem={({ item, index }) => renderPackage({ item, index })}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingTop: 24 }]}
      />

      {/* Thêm nút khôi phục giao dịch */}
      {/* <TouchableOpacity 
        style={styles.restoreButton} 
        onPress={handleRestorePurchases}
      >
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    paddingHorizontal: 16,
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
  buyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  currentPackageContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentPackageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  currentPackageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  currentPackageContent: {
    gap: 8,
  },
  expiryDate: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    marginHorizontal: 16,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
  currentPlanButton: {
    backgroundColor: "#4CAF50",
  },
  customButton: {
    backgroundColor: "#2c3e50",
  },
  customButtonText: {
    color: "#fff",
  },
  subscriptionDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  restoreButton: {
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  restoreButtonText: {
    color: "#0a7ea4",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
