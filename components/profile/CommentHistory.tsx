import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal, FlatList, ActivityIndicator, Alert, Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "@/services/api";

interface CommentHistory {
  _id: string;
  source: string;
  status: string;
  createdAt: string;
  fileUrl?: string;
  logUrl?: string;
}

interface CommentHistoryProps {
  visible: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function CommentHistory({ visible, onClose }: CommentHistoryProps) {
  const [commentHistory, setCommentHistory] = useState<CommentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchCommentHistory();
    }
  }, [visible]);

  const fetchCommentHistory = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get<{ items: CommentHistory[] }>(`/comments/history?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      
      if (pageNum === 1) {
        setCommentHistory(response.items);
      } else {
        setCommentHistory(prev => [...prev, ...response.items]);
      }
      
      setHasMore(response.items.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching comment history:', error);
      Alert.alert('Error', 'Failed to fetch comment history');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCommentHistory(page + 1);
    }
  };

  const handleDownload = async (fileUrl: string, id: string) => {
    try {
      setDownloadingId(id);
      await Linking.openURL(fileUrl);
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open download link');
    } finally {
      setDownloadingId(null);
    }
  };

  const renderHistoryItem = ({ item }: { item: CommentHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyContent}>
        <Text style={styles.historyUrl} numberOfLines={1}>{item.source}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        <View style={styles.historyStatus}>
          <Text style={[styles.statusText, { color: item.status === 'stop' ? '#ff4444' : '#4CAF50' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      {item.fileUrl && (
        <Pressable 
          style={[styles.downloadButton, downloadingId === item._id && styles.downloadingButton]}
          onPress={() => handleDownload(item.fileUrl!, item._id)}
          disabled={downloadingId === item._id}
        >
          {downloadingId === item._id ? (
            <ActivityIndicator size="small" color="#4c669f" />
          ) : (
            <> 
            <MaterialIcons name="file-download" size={24} color="#4c669f" />
            <Text>xlsx</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4c669f" />
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comment History</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </Pressable>
          </View>
          <FlatList
            data={commentHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.historyList}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "70%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },
  historyContent: {
    flex: 1,
  },
  historyUrl: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
  },
  historyStatus: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  downloadButton: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadingButton: {
    opacity: 0.7,
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
