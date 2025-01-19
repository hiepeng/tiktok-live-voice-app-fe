import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Pressable, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../store/useUserStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import CommentHistory from '@/components/profile/CommentHistory';

export default function ProfileScreen() {
  const router = useRouter();
  const { _id, email, avatar, signOut } = useUserStore();
  const [showHistory, setShowHistory] = useState(false);

  console.log(email, avatar, "email, avatar");

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        {/* Profile Actions */}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="#555" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => setShowHistory(true)}
          >
            <MaterialIcons name="history" size={24} color="#555" />
            <Text style={styles.actionText}>Comment History</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <MaterialIcons name="settings" size={24} color="#555" />
            <Text style={styles.actionText}>Settings</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>

        {/* Comment History Modal */}
        <CommentHistory 
          visible={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
