import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Package, SubscriptionType } from "@/interfaces/package.interface";
import PaymentService from "@/services/PaymentService";
import PackageDetailModal from "@/components/PackageDetailModal";

export default function PackagesScreen() {
  const { currentSubscription, packages, isLoading, isPurchasing, error, fetchCurrentSubscription, fetchPackages } =
    useSubscriptionStore();

  const [iapInitialized, setIapInitialized] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  useEffect(() => {
    fetchCurrentSubscription();
    fetchPackages();
    initializeIAP();

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
      console.error("Failed to initialize IAP", error);
    }
  };

  const handlePurchase = (pkg: Package) => {
    if (pkg.type === SubscriptionType.FREE) {
      Alert.alert("Info", "Free plan is automatically activated when paid plans expire");
      return;
    }

    setSelectedPackage(pkg);
  };

  const confirmPurchase = async (pkg: Package, duration: 1 | 6 | 12) => {
    try {
      if (!iapInitialized) {
        throw new Error("Payment service not initialized");
      }

      await PaymentService.purchaseSubscription(pkg.type, duration);
      setSelectedPackage(null);
    } catch (error) {
      Alert.alert("Error", JSON.stringify(error));
      console.error("Subscription error:", error);
    }
  };

  const handlePackageAction = (pkg: Package) => {
    if (pkg.type === SubscriptionType.CUSTOM) {
      Linking.openURL("https://tiktok-live-voice.com/enterprise");
      return;
    }
    handlePurchase(pkg);
  };

  const renderPackagePrice = (pkg: Package) => {
    if (pkg.type === SubscriptionType.CUSTOM) {
      return <Text style={styles.packagePrice}>Contact Us</Text>;
    }

    return (
      <Text style={styles.packagePrice}>
        {pkg.baseFormattedPrice}
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
              <Text style={styles.featureText}>
                {item.maxDuration === -1 ? "Unlimited stream duration" : `${item.maxDuration} minutes per stream`}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                {`${item.maxConcurrentStreams} concurrent ${item.maxConcurrentStreams > 1 ? "streams" : "stream"}`}
              </Text>
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
        disabled={isPurchasing}
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
                ? "Upgrade"
                : "Choose Plan"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Packages" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Packages" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Packages" />
      <FlatList
        data={packages}
        renderItem={({ item, index }) => renderPackage({ item, index })}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      {selectedPackage && (
        <PackageDetailModal
          visible={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          package={selectedPackage}
          onSelectDuration={duration => confirmPurchase(selectedPackage, duration)}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    margin: 16,
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
  disabledButton: {
    opacity: 0.7,
  },
});
