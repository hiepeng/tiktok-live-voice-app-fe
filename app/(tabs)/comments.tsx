import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView, Text, FlatList, Image, Dimensions, TouchableOpacity } from "react-native";
import { useCommentStore } from "@/store/useCommentStore";
import { useTTSStore } from '@/store/useTTSStore';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import OptionsModal from "@/components/comments/OptionsModal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsModal from "@/components/comments/SettingsModal";

const { width } = Dimensions.get("window");

const CommentsScreen = () => {
  const { comments, maxComments } = useCommentStore();
  const { speak, stop, isSpeaking, language, autoRead, toggleAutoRead } = useTTSStore();
  const flatListRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(true);
  const [isLayoutComplete, setIsLayoutComplete] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vi-VN');
  const [pressedCommentId, setPressedCommentId] = useState<string | null>(null);

  // Kiểm tra vị trí cuộn
  const handleScroll = event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    setIsAtEnd(isCloseToBottom);
  };

  // Cuộn xuống cuối sau khi layout hoàn tất
  const scrollToEnd = () => {
    if (isLayoutComplete) {
      setIsAutoScrolling(true);
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        // Reset isAutoScrolling sau khi animation hoàn tất
        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 300);
      });
    }
  };

  useEffect(() => {
    if (isAtEnd && comments.length > 0) {
      scrollToEnd();
    }
  }, [comments, isAtEnd, isLayoutComplete]);

  // Load saved language preference
  useEffect(() => {
    AsyncStorage.getItem('tts-language').then(lang => {
      if (lang) setSelectedLanguage(lang);
    });
  }, []);

  // Xử lý TTS khi có comment mới
  useEffect(() => {
    if (autoRead && comments.length > 0) {
      const latestComment = comments[comments.length - 1];
      speak(`${latestComment.author.name}: ${latestComment.text}`, language);
    }
  }, [comments, autoRead, language, speak]);

  // Dừng TTS khi unmount component
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    AsyncStorage.setItem('tts-language', language);
    stop();
  };

  const handleCommentPress = (comment: any) => {
    setPressedCommentId(comment.id);
    stop();
    speak(`${comment.author.name}: ${comment.text}`, selectedLanguage);
    setTimeout(() => setPressedCommentId(null), 200); // hiệu ứng bấm 200ms
  };

  const renderComment = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleCommentPress(item)}
      activeOpacity={0.5}
      style={pressedCommentId === item.id ? { opacity: 0.6 } : undefined}
    >
      <LinearGradient
        colors={index % 2 === 0 ? ["#f6f9fc", "#ffffff"] : ["#ffffff", "#f6f9fc"]}
        style={styles.commentContainer}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.author.avatar }}
            style={styles.avatar}
            defaultSource={require("../../assets/images/default-avatar.jpg")}
          />
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.timestamp}>
              {new Date(Number(item.timestamp)).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const SpeakerButton = (
    <View style={{ flexDirection: 'row', gap: 15 }}>
      <TouchableOpacity onPress={() => setShowOptionsModal(true)}>
        <Ionicons 
          name={autoRead ? "volume-high" : "volume-mute"} 
          size={24} 
          color={autoRead ? "#0a7ea4" : "#000"} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
        <Ionicons name="settings-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title={`Comments (${comments.length > maxComments-1 ? maxComments + "+" : comments.length})`}
        rightComponent={SpeakerButton}
      />
      <View style={styles.listWrapper}>
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onLayout={() => setIsLayoutComplete(true)}
          onScroll={handleScroll}
          onContentSizeChange={() => {
            if (isAtEnd) {
              scrollToEnd();
            }
          }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
        <LinearGradient
          colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
          style={styles.fadeGradient}
          pointerEvents="none"
        />
      </View>

      {!isAtEnd && !isAutoScrolling && comments.length > 0 && (
        <TouchableOpacity style={styles.scrollToBottomButton} onPress={scrollToEnd}>
          <Ionicons name="arrow-down" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <OptionsModal
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        isSpeaking={autoRead}
        onToggleSpeaking={toggleAutoRead}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
    // paddingBottom: 50,
  },
  commentContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressedCommentItem: {
    backgroundColor: '#e0f7fa',
    transform: [{ scale: 0.97 }],
    shadowColor: '#1976D2',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  authorName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1a1a1a",
  },
  messageContainer: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 12,
    maxWidth: width * 0.7,
  },
  commentText: {
    fontSize: 15,
    color: "#4a4a4a",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  separator: {
    height: 8,
  },
  scrollToBottomButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#3b5998",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listWrapper: {
    flex: 1,
    position: "relative",
  },
  fadeGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 1,
  },
});

export default CommentsScreen;
