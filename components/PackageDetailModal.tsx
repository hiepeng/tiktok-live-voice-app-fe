import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Package } from "@/interfaces/package.interface";
import { MaterialIcons } from "@expo/vector-icons";

interface PackageDetailModalProps {
  visible: boolean;
  onClose: () => void;
  package: Package;
  onSelectDuration: (duration: 1 | 6 | 12) => void;
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  visible,
  onClose,
  package: pkg,
  onSelectDuration,
}) => {
  console.log(JSON.stringify(pkg), "pkg");
  const getSubscriptionOffer = (duration: 1 | 6 | 12) => {
    const basePlanId = pkg.type + duration;
    return pkg.subscriptionOfferDetails?.find(offer => offer.basePlanId === basePlanId);
  };

  const renderDurationOption = (duration: 1 | 6 | 12) => {
    const offer = getSubscriptionOffer(duration);
    console.log(offer, "offer");
    if (!offer) return null;

    const pricePhase = offer.pricingPhases.pricingPhaseList[0];
    const originalPrice = pkg.basePrice * duration;
    const currentPrice = parseInt(pricePhase.priceAmountMicros) / 1000000;
    const discount = originalPrice > currentPrice ? (originalPrice - currentPrice) / originalPrice : 0;

    return (
      <TouchableOpacity key={duration} style={styles.durationOption} onPress={() => onSelectDuration(duration)}>
        <View style={styles.durationHeader}>
          <View>
            <Text style={styles.durationTitle}>
              {duration} {duration === 1 ? "Month" : "Months"}
            </Text>
            <Text style={styles.monthlyPrice}>
              {pricePhase.priceCurrencyCode} {pricePhase.formattedPrice}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{Math.round(discount * 100)}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.totalPrice}>{pricePhase.formattedPrice}</Text>
          {discount > 0 && (
            <Text style={styles.originalPrice}>
              {pkg.basePriceCurrencyCode} {originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {discount > 0 && (
          <View style={styles.savingsContainer}>
            <MaterialIcons name="local-offer" size={16} color="#4CAF50" />
            <Text style={styles.savingsText}>
              Save {pkg.basePriceCurrencyCode} {(originalPrice - currentPrice).toLocaleString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{pkg.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {renderDurationOption(1)}
            {renderDurationOption(6)}
            {renderDurationOption(12)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  durationOption: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  durationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  durationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  monthlyPrice: {
    fontSize: 14,
    color: "#666",
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  savingsText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: 4,
  },
  featuresContainer: {
    marginTop: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
});

export default PackageDetailModal;
