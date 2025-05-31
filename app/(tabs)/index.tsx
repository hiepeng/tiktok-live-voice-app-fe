import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../../hooks/useSocket";
import { useCommentStore } from "@/store/useCommentStore";
import { useCommentUrlStore } from "@/store/useCommentUrlStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { startBackgroundService, stopBackgroundService } from "../utils/BackgroundService";
import { keepScreenOn, allowScreenOff } from "../utils/ScreenManager";

interface Metadata {
  viewCount?: number;
  shareCount?: number;
  likeCount?: number;
}

interface UrlItem {
  taskId: string;
  url: string;
  status: "idle" | "pending" | "decoding" | "running" | "stop" | "stopping";
  createdAt: Date;
  metadata?: Metadata;
  key?: string;
}

interface Comment {
  id: string;
  text: string;
  author: {
    name: string;
    id: string;
    avatar: string;
  };
  timestamp: number;
  platform: string;
}

const FullScreenWebView: React.FC = () => {
  const socket = useSocket();
  const { urls, fetchActiveUrls, startUrl, stopUrl } = useCommentUrlStore();
  const [newUrl, setNewUrl] = useState("");
  const router = useRouter();
  const { currentSubscription } = useSubscriptionStore();

  useEffect(() => {
    fetchActiveUrls();
    startBackgroundService();
    keepScreenOn();

    return () => {
      stopBackgroundService();
      allowScreenOff();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("message-task", message => {
      if (message.act === "update") {
        const content = message.info;

        if (message.name === "comment") {
          message.data.forEach((comment: Comment) => {
            useCommentStore.getState().addComment(comment);
          });
        } else if (message.name === "metadata") {
          console.log(1);
          console.log(message);
        } else if (message.name === "join") {
          console.log(2);
        } else {
          console.log(message.name);
        }
      }
    });

    socket.on("error", error => {
      Alert.alert("Error", error.message);
    });

    return () => {
      socket.off("tiktok-comment");
      socket.off("message-task");
      socket.off("error");
    };
  }, [socket]);

  const handleError = (error: Error) => {
    if (error.message.startsWith("Maximum concurrent streams")) {
      Alert.alert(
        "Package Limit Reached",
        `Your current package (${currentSubscription?.name}) allows maximum ${currentSubscription?.maxConcurrentStreams} concurrent ${
          currentSubscription?.maxConcurrentStreams && currentSubscription?.maxConcurrentStreams > 1
            ? "streams"
            : "stream"
        }. Would you like to upgrade your package?`,
        [
          {
            text: "Upgrade Package",
            onPress: () => router.push("/(tabs)/packages"),
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    } else {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) {
      Alert.alert("Error", "Please enter a valid URL");
      return;
    }
    try {
      await startUrl(newUrl);
      setNewUrl("");
      Alert.alert("Success", "Started decoding TikTok live stream");
    } catch (error) {
      if (error instanceof Error) {
        handleError(error);
      } else {
        Alert.alert("Error", "Unknown error occurred");
      }
    }
  };

  const handleStopStream = async (taskId: string) => {
    try {
      await stopUrl(taskId);
    } catch (error) {
      Alert.alert("Error", "Failed to stop stream");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Home" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>TikTok Live Comment Reader</Text>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="Enter TikTok Live URL"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={[styles.button, { backgroundColor: "#4CAF50" }]} onPress={handleAddUrl}>
              <Text style={styles.buttonText}>Add Link</Text>
            </TouchableOpacity>
          </View>

          {urls
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(item => (
              <View key={item.key || item.taskId} style={styles.urlContainer}>
                <View style={styles.streamInfo}>
                  <Text style={styles.urlText} numberOfLines={1}>
                    {item.url}
                  </Text>
                  <View style={styles.metaContainer}>
                    <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                  <View style={styles.statsContainer}>
                    {item.metadata && (
                      <>
                        <View style={styles.statItem}>
                          <MaterialIcons name="visibility" size={14} color="#666" />
                          <Text style={styles.statText}> {item.metadata.viewCount || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialIcons name="favorite" size={14} color="#FF69B4" />
                          <Text style={styles.statText}> {item.metadata.likeCount || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                          <MaterialIcons name="share" size={14} color="#666" />
                          <Text style={styles.statText}> {item.metadata.shareCount || 0}</Text>
                        </View>
                      </>
                    )}
                    <Text style={[styles.statusText, getStatusColor(item.status)]}>{item.status}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    getButtonColor(item.status),
                    (item.status === "pending" || item.status === "stop" || item.status === "stopping") &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() => (item.status === "running" ? handleStopStream(item.taskId) : null)}
                  disabled={item.status === "pending" || item.status === "stop" || item.status === "stopping"}
                >
                  <Text style={styles.buttonText}>
                    {item.status === "running"
                      ? "Stop"
                      : item.status === "stopping"
                        ? "Stopping..."
                        : item.status === "decoding"
                          ? "Decoding..."
                          : "Stopped"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputSection: {
    marginBottom: 20,
  },
  streamInfo: {
    flex: 1,
    marginRight: 15,
  },
  urlText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    paddingHorizontal: 20,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  metaContainer: {
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
});

const getStatusColor = (status: string) => ({
  backgroundColor:
    status === "running"
      ? "#e3f2fd"
      : status === "stopping"
        ? "#fff3e0"
        : status === "decoding"
          ? "#e8f5e9"
          : "#f5f5f5",
  color:
    status === "running"
      ? "#1976d2"
      : status === "stopping"
        ? "#f57c00"
        : status === "decoding"
          ? "#388e3c"
          : "#9e9e9e",
});

const getButtonColor = (status: string) => ({
  backgroundColor:
    status === "running"
      ? "#ef5350"
      : status === "stopping"
        ? "#ff9800"
        : status === "decoding"
          ? "#4caf50"
          : "#9e9e9e",
});

export default FullScreenWebView;
