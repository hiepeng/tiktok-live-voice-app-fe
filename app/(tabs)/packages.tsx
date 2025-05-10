import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Package } from "@/interfaces/package.interface";
import PaymentService from "@/services/PaymentService";

export default function PackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await PaymentService.fetchPackages();
        setPackages(data);
      } catch (err: any) {
        setError(err?.message || "Lỗi khi tải danh sách gói cước");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handlePurchase = async (pkg: Package) => {
    setPurchaseError(null);
    try {
      await PaymentService.purchaseSubscription(pkg._id);
      alert("Mua gói thành công!");
    } catch (err: any) {
      setPurchaseError(err?.message || "Lỗi khi mua gói cước");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Danh sách gói cước</Text>
        {isLoading && <ActivityIndicator size="large" color="#000" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {packages.map((pkg) => (
          <View key={pkg._id} style={styles.packageBox}>
            <Text style={styles.packageName}>{pkg.name}</Text>
            <Text>Giá: {pkg.price}đ</Text>
            <Text>Thời hạn: {pkg.duration} ngày</Text>
            <Button title="Mua gói này" onPress={() => handlePurchase(pkg)} />
          </View>
        ))}
        {purchaseError && <Text style={styles.error}>{purchaseError}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  error: { color: 'red', marginVertical: 8 },
  packageBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  packageName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
});
