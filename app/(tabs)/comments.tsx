import React from 'react';
import { StyleSheet, View, SafeAreaView, Text, FlatList, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useCommentStore } from '@/store/useCommentStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CommentsScreen = () => {
  const { comments, clearComments } = useCommentStore();

  const renderComment = ({ item, index }) => (
    <LinearGradient
      colors={index % 2 === 0 ? ['#f6f9fc', '#ffffff'] : ['#ffffff', '#f6f9fc']}
      style={styles.commentContainer}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.author.avatar }}
          style={styles.avatar}
          defaultSource={require('../../assets/images/default-avatar.jpg')}
        />
        <View style={styles.onlineIndicator} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.authorName}>{item.author.name}</Text>
          <Text style={styles.timestamp}>
            {new Date(Number(item.timestamp) * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Live Comments</Text>
          {comments.length > 0 && (
            <TouchableOpacity 
              onPress={clearComments}
              style={styles.clearButton}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>{comments.length} comments</Text>
      </LinearGradient>
      
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  listContainer: {
    padding: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1a1a1a',
  },
  messageContainer: {
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 12,
    maxWidth: width * 0.7,
  },
  commentText: {
    fontSize: 15,
    color: '#4a4a4a',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 8,
  },
});

export default CommentsScreen;