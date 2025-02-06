import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import Header from "@/components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Package, SubscriptionType } from "@/interfaces/package.interface";

export default function PackagesScreen() {
  const {
    currentSubscription,
    packages,
    isLoading,
    error,
    fetchCurrentSubscription,
    purchaseSubscription,
    fetchPackages,
  } = useSubscriptionStore();

  useEffect(() => {
    fetchCurrentSubscription();
    fetchPackages();
  }, []);

  const handlePurchase = (pkg: Package) => {
    if (pkg.type === SubscriptionType.FREE) {
      Alert.alert("Info", "Free plan is automatically activated when paid plans expire");
      return;
    }

    Alert.alert("Select Duration", "Choose your subscription period:", [
      {
        text: "1 Month",
        onPress: () => confirmPurchase(pkg, 1, pkg.price),
      },
      {
        text: "6 Months (10% off)",
        onPress: () => confirmPurchase(pkg, 6, pkg.price * 6 * 0.9),
      },
      {
        text: "12 Months (20% off)",
        onPress: () => confirmPurchase(pkg, 12, pkg.price * 12 * 0.8),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const confirmPurchase = async (pkg: Package, duration: 1 | 6 | 12, totalPrice: number) => {
    Alert.alert(
      "Confirm Purchase",
      `Subscribe to ${pkg.name} for ${duration} ${duration === 1 ? "month" : "months"}?\n\nTotal: $${totalPrice.toFixed(2)}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await purchaseSubscription(pkg.type, duration);
              
              Alert.alert(
                "Success",
                "Subscription updated successfully!",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      fetchCurrentSubscription();
                    }
                  }
                ]
              );

            } catch (error) {
              let errorMessage = 'Failed to purchase subscription';
              
              if (error instanceof Error) {
                if (error.message.includes('insufficient_funds')) {
                  errorMessage = 'Insufficient funds';
                } else if (error.message.includes('invalid_package')) {
                  errorMessage = 'Invalid package selected';
                } else if (error.message.includes('already_subscribed')) {
                  errorMessage = 'You already have an active subscription';
                }
              }

              Alert.alert('Error', errorMessage);
              console.error('Purchase error:', error);
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
            <View style={[styles.statusBadge, { backgroundColor:  "#4CAF50"  }]}>
              <Text style={styles.statusText}>{ "Active" }</Text>
            </View>
          )}
        </View>

        <View style={styles.currentPackageContent}>
          <Text style={styles.packageName}>{currentSubscription.name}</Text>
          {currentSubscription.type !== SubscriptionType.FREE && currentSubscription.endDate && (
            <Text style={styles.expiryDate}>
              Expires: {currentSubscription.endDate.toLocaleDateString()}
            </Text>
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

  const renderPackage = ({ item: pkg }: { item: Package }) => (
    <View style={styles.packageCard}>
      <Text style={styles.packageName}>{pkg.name}</Text>
      {renderPackagePrice(pkg)}

      <View style={styles.featuresContainer}>
        {pkg.type !== SubscriptionType.CUSTOM && (
          <>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{pkg.maxDuration + " minutes per stream"}</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{pkg.maxConcurrentStreams + " concurrent stream"}</Text>
            </View>
          </>
        )}
        {pkg.features?.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.buyButton,
          pkg.type === SubscriptionType.CUSTOM && styles.customButton,
          currentSubscription?.type === pkg.type && styles.currentPlanButton,
        ]}
        onPress={() => handlePackageAction(pkg)}
        disabled={currentSubscription?.type === pkg.type}
      >
        <Text
          style={[
            styles.buyButtonText,
            pkg.type === SubscriptionType.CUSTOM && styles.customButtonText,
            currentSubscription?.type === pkg.type && { color: "#fff" },
          ]}
        >
          {pkg.type === SubscriptionType.CUSTOM
            ? "Contact Us"
            : currentSubscription?.type === pkg.type
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
            type: SubscriptionType.CUSTOM,
            price: 0,
            maxDuration: -1,
            maxConcurrentStreams: -1,
            features: [
              "unlimited most advanced functions, and additional special functions upon request",
              "Dedicated support team",
            ]
          },
        ]}
        renderItem={renderPackage}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderCurrentSubscription}
        refreshing={isLoading}
        onRefresh={() => {
          fetchCurrentSubscription();
          fetchPackages();
        }}
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
    color: '#666',
    marginTop: 4,
  },
});
