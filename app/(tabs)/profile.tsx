import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUserStore } from "../../store/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import CommentHistory from "../../components/CommentHistory";
import Header from "../../components/Header";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import SubscriptionHistory from "@/components/SubscriptionHistory";

export default function ProfileScreen() {
  const router = useRouter();
  const { _id, email, avatar, signOut } = useUserStore();
  const [showCommentHistory, setShowCommentHistory] = useState(false);
  const [showSubscriptionHistory, setShowSubscriptionHistory] = useState(false);
  const { currentSubscription, isLoading, error } = useSubscriptionStore();

  console.log(email, avatar, "email, avatar");

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profile" />
      <View style={{ paddingTop: 24 }}>
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      <View style={styles.container}>
        {/* Hiển thị current package */}
        {currentSubscription && (
          <View style={styles.currentPackageContainer}>
            <Text style={styles.currentPackageTitle}>Current Package</Text>
            <Text style={styles.currentPackageName}>{currentSubscription.name}</Text>
            <Text style={styles.currentPackageType}>{currentSubscription.type}</Text>
            <Text style={styles.currentPackageExpire}>Expires: {currentSubscription.expireAt ? new Date(currentSubscription.expireAt).toLocaleDateString() : 'N/A'}</Text>
          </View>
        )}
        {/* Profile Actions */}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionButton} onPress={() => setShowSubscriptionHistory(true)}>
            <MaterialIcons name="history" size={24} color="#0a7ea4" />
            <Text style={styles.actionText}>Subscription History</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* Comment History Modal */}
        <CommentHistory visible={showCommentHistory} onClose={() => setShowCommentHistory(false)} />
        {/* Subscription History Modal */}
        <SubscriptionHistory visible={showSubscriptionHistory} onClose={() => setShowSubscriptionHistory(false)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f6fa",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#0a7ea4",
    backgroundColor: "#e1eaf2",
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0a7ea4",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f6fa",
    paddingHorizontal: 0,
  },
  header: {
    backgroundColor: "white",
    padding: 24,
    marginBottom: 16,
    borderRadius: 18,
    marginHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsContainer: {
    backgroundColor: "white",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4fa",
  },
  actionText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  currentPackageContainer: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
    borderRadius: 18,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  currentPackageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0a7ea4",
    marginBottom: 10,
  },
  currentPackageName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  currentPackageType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  currentPackageExpire: {
    fontSize: 16,
    color: "#666",
  },
});
