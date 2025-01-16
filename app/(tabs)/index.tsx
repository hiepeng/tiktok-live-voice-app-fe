import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TextInput, Button, Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '../../constants/config';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FullScreenWebView: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tiktok/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      Alert.alert('Success', 'Started monitoring TikTok live stream');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TikTok Live Comment Reader</Text>
        <Text style={[styles.status, { color: isConnected ? 'green' : 'red' }]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Enter TikTok Live URL"
          placeholderTextColor="#999"
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Start Reading"
            onPress={handleSubmit}
            color="#FF2D55"
            disabled={!isConnected}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  status: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FullScreenWebView;
