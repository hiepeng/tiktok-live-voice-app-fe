import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Modal, Pressable } from 'react-native';
import { api } from '@/services/api';

interface SubscriptionItem {
  _id: string;
  name: string;
  type: string;
  price: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface SubscriptionHistoryProps {
  visible: boolean;
  onClose: () => void;
}

const SubscriptionHistory = ({ visible, onClose }: SubscriptionHistoryProps) => {
  const [history, setHistory] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    api.get<SubscriptionItem[]>('/subscriptions/history')
      .then(setHistory)
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Subscription History</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : error ? (
            <Text style={{ color: 'red', marginVertical: 16 }}>{error}</Text>
          ) : !history.length ? (
            <Text style={{ marginVertical: 16 }}>No subscription history found.</Text>
          ) : (
            <FlatList
              data={history}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.name}>{item.name} ({item.type})</Text>
                  <Text style={styles.detail}>Price: {item.price} | Duration: {item.durationMonths} months</Text>
                  <Text style={styles.detail}>From: {new Date(item.startDate).toLocaleDateString()} - To: {new Date(item.endDate).toLocaleDateString()}</Text>
                  <Text style={styles.status}>Status: {item.status}</Text>
                </View>
              )}
              style={{ maxHeight: 350 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0a7ea4',
    alignSelf: 'center',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 13,
    color: '#0a7ea4',
    marginTop: 2,
  },
});

export default SubscriptionHistory;
