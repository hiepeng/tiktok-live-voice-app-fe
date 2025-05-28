import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { View, Text, StyleSheet, Pressable, Modal, FlatList, ActivityIndicator, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "@/services/api";
import Header from "./Header";

interface CommentHistory {
  _id: string;
  source: string;
  status: string;
  createdAt: string;
  fileUrl?: string;
  logUrl?: string;
}

interface CommentHistoryProps {
  visible?: boolean;
  onClose?: () => void;
  standalone?: boolean;
  onlyRunning?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default forwardRef(function CommentHistory({ visible = true, onClose, standalone = false, onlyRunning = false }: CommentHistoryProps, ref) {
  const [commentHistory, setCommentHistory] = useState<CommentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useImperativeHandle(ref, () => ({
    fetchCommentHistory,
  }));

  useEffect(() => {
    if (standalone || visible) {
      fetchCommentHistory();
    }
  }, [visible, standalone]);

  const fetchCommentHistory = async (pageNum = 1) => {
    try {
      setLoading(true);
      let url = `/comments/history?page=${pageNum}&limit=${ITEMS_PER_PAGE}`;
      if (onlyRunning) {
        url = `/comments/history?status=running&page=${pageNum}&limit=${ITEMS_PER_PAGE}`;
      }
      const response = await api.get<{ items: CommentHistory[] }>(url);
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
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <MaterialIcons
          name={item.status === 'stop' ? 'block' : 'check-circle'}
          size={28}
          color={item.status === 'stop' ? '#ff4444' : '#4CAF50'}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardSource} numberOfLines={1}>{item.source}</Text>
          <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.cardStatus, { color: item.status === 'stop' ? '#ff4444' : '#4CAF50' }]}>{item.status}</Text>
        {item.fileUrl && (
          <Pressable
            style={({ pressed }) => [styles.downloadButton, pressed && styles.downloadButtonPressed, downloadingId === item._id && styles.downloadingButton]}
            onPress={() => handleDownload(item.fileUrl!, item._id)}
            disabled={downloadingId === item._id}
          >
            {downloadingId === item._id ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : (
              <MaterialIcons name="file-download" size={24} color="#0a7ea4" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={60} color="#b0b0b0" style={{ marginBottom: 10 }} />
      <Text style={styles.emptyText}>Không có lịch sử</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0a7ea4" />
      </View>
    );
  };

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  if (standalone) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Comment History" />
        <FlatList
          data={commentHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={renderSeparator}
        />
      </SafeAreaView>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header title="Comment History" rightComponent={
          <Pressable onPress={onClose} style={{ padding: 4 }}>
            <MaterialIcons name="close" size={28} color="#333" />
          </Pressable>
        } />
        <FlatList
          data={commentHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={renderSeparator}
        />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  separator: {
    height: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 70,
  },
  cardSource: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 13,
    color: "#888",
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  downloadButton: {
    backgroundColor: "#e0f3fa",
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },
  downloadButtonPressed: {
    backgroundColor: "#b4e0f7",
  },
  downloadingButton: {
    opacity: 0.6,
  },
  footer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 17,
    color: "#b0b0b0",
    fontWeight: "500",
  },
});
