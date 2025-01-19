import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { api } from "@/services/api";
import { useSocket } from "../../hooks/useSocket";
import { useCommentStore } from "@/store/useCommentStore";

interface UrlItem {
  taskId: string;
  url: string;
  status: "idle" | "pending" | "decoding" | "running" | "stop" | "stopping";
  createdAt: Date;
}

interface StartResponse {
  data: {
    taskId: string;
    createdAt: string; // ISO string from server
  };
}

interface ApiResponse {
  data: {
    _id: string;
    source: string;
    status: string;
    createdAt: string;
  }[];
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
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const fetchInitialUrls = async () => {
      try {
        const response = await api.get<ApiResponse>("/comments/active");
        console.log(response, "response");
        if (response?.data && Array.isArray(response.data)) {
          const activeUrls = response.data.map(item => ({
            taskId: item._id,
            url: item.source,
            status: item.status as UrlItem["status"],
            createdAt: new Date(item.createdAt)
          }));

          if (activeUrls.length > 0) {
            setUrls(activeUrls);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial URLs:", error);
      }
    };

    fetchInitialUrls();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("message-task", message => {
      if (message.act === "update") {
        const content = message.info;
        setUrls(prevUrls =>
          prevUrls.map(item => (item.taskId === content.taskId ? { ...item, status: "running" } : item)),
        );

        if (message.name === "comment") {
          message.data.forEach((comment: Comment) => {
            useCommentStore.getState().addComment(comment);
          });
        } else if (message.name === "metadata") {
          console.log(1)
        } else if (message.name === "join") {
          console.log(2)
        } else {
          console.log(message.name)
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

  const handleAddUrl = async () => {
    if (!newUrl.trim()) {
      Alert.alert("Error", "Please enter a valid URL");
      return;
    }

    try {
      const res = await api.post<StartResponse>("/comments/start", { url: newUrl });

      setUrls(prevUrls => [
        {
          taskId: res.data.taskId,
          url: newUrl,
          status: "decoding",
          createdAt: new Date(res.data.createdAt),
        },
        ...prevUrls,
      ]);

      setNewUrl("");
      Alert.alert("Success", "Started decoding TikTok live stream");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  const stopStream = async (taskId: string) => {
    try {
      setUrls(urls.map(item => (item.taskId === taskId ? { ...item, status: "pending" } : item)));
      await api.post("/comments/stop", { taskId });
      setUrls(urls.map(item => (item.taskId === taskId ? { ...item, status: "stop" } : item)));
    } catch (error) {
      Alert.alert("Error", "Failed to stop stream");
      setUrls(urls.map(item => (item.taskId === taskId ? { ...item, status: "running" } : item)));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>TikTok Live Comment Reader</Text>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder="Enter TikTok Live URL"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#4CAF50" }]} onPress={handleAddUrl}>
              <Text style={styles.buttonText}>Add Stream</Text>
            </TouchableOpacity>
          </View>

          {urls
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(item => (
              <View key={item.taskId} style={styles.urlContainer}>
                <View style={styles.streamInfo}>
                  <Text style={styles.urlText} numberOfLines={1}>
                    {item.url}
                  </Text>
                  <View style={styles.metaContainer}>
                    <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.status === "running"
                              ? "#4CAF50"
                              : item.status === "decoding"
                                ? "#FFA500"
                                : item.status === "stopping"
                                  ? "#FFA500"
                                  : item.status === "stop"
                                    ? "#FF4444"
                                    : "#999",
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        item.status === "running"
                          ? "#FF4444"
                          : item.status === "stopping"
                            ? "#FFA500"
                            : item.status === "decoding"
                              ? "#FFA500"
                              : "#999",
                    },
                    (item.status === "pending" || item.status === "stop" || item.status === "stopping") &&
                      styles.buttonDisabled,
                  ]}
                  onPress={() => (item.status === "running" ? stopStream(item.taskId) : null)}
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
    marginRight: 10,
  },
  urlText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
});

export default FullScreenWebView;
