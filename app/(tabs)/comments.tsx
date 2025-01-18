import React from 'react';
import { StyleSheet, View, SafeAreaView, Text, FlatList, Image } from 'react-native';
import { useCommentStore } from '@/store/useCommentStore';

const CommentsScreen = () => {
  const { comments } = useCommentStore();

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.avatarContainer}>
        {/* <Image 
          source={{ uri: item.author.avatar }} 
          style={styles.avatar}
          defaultSource={require('../../assets/images/default-avatar.png')}
        /> */}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.authorName}>{item.author.name}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Live Comments</Text>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default CommentsScreen;