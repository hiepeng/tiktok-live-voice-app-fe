import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { BACKEND_URL } from '../../constants/config';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '@/services/api';

interface UrlItem {
  taskId: string;
  url: string;
  status: 'idle' | 'pending' | 'decoding' | 'running';
}

interface StartResponse {
  data: {
    taskId: string;
  }
}

const FullScreenWebView: React.FC = () => {
  const [urls, setUrls] = useState<UrlItem[]>([{ 
    taskId: '',
    url: 'https://www.tiktok.com/@didi5.7/live', 
    status: 'idle' 
  }]);

  const addNewUrl = () => {
    setUrls([...urls, { 
      taskId: '',
      url: '', 
      status: 'idle' 
    }]);
  };

  const updateUrl = (taskId: string, newUrl: string) => {
    setUrls(urls.map(item => 
      item.taskId === taskId ? { ...item, url: newUrl } : item
    ));
  };

  const removeUrl = (taskId: string) => {
    if (urls.length > 1) {
      setUrls(urls.filter(item => item.taskId !== taskId));
    }
  };

  const handleSubmit = async (taskId: string): Promise<void> => {
    const urlItem = urls.find(item => item.taskId === taskId);
    if (!urlItem || !urlItem.url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    try {
      setUrls(urls.map(item =>
        item.taskId === taskId ? { ...item, status: 'pending' } : item
      ));

      const res = await api.post<StartResponse>('/comments/start', { url: urlItem.url });
      
      setUrls(urls.map(item =>
        item.taskId === taskId ? { 
          ...item, 
          taskId: res.data.taskId,
          status: 'decoding' 
        } : item
      ));

      Alert.alert('Success', 'Started decoding TikTok live stream');
    } catch (error) {
      setUrls(urls.map(item =>
        item.taskId === taskId ? { ...item, status: 'idle' } : item
      ));
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const stopStream = async (taskId: string) => {
    try {
      setUrls(urls.map(item =>
        item.taskId === taskId ? { ...item, status: 'pending' } : item
      ));

      await api.post('/comments/stop', { taskId });

      setUrls(urls.map(item =>
        item.taskId === taskId ? { ...item, status: 'idle' } : item
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to stop stream');
      setUrls(urls.map(item =>
        item.taskId === taskId ? { ...item, status: 'running' } : item
      ));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>TikTok Live Comment Reader</Text>
          
          {urls.map((item) => (
            <View key={item.taskId} style={styles.urlContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={item.url}
                  onChangeText={(text) => updateUrl(item.taskId, text)}
                  placeholder="Enter TikTok Live URL"
                  placeholderTextColor="#999"
                />
                {urls.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeUrl(item.taskId)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="remove-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { 
                    backgroundColor: item.status === 'running' ? '#FF4444' : 
                                    item.status === 'decoding' ? '#FFA500' : '#4CAF50'
                  },
                  (item.status === 'pending' || item.status === 'decoding') && styles.buttonDisabled
                ]}
                onPress={() => item.status === 'running' ? stopStream(item.taskId) : handleSubmit(item.taskId)}
                disabled={item.status === 'pending' || item.status === 'decoding'}
              >
                <Text style={styles.buttonText}>
                  {item.status === 'running' ? 'Stop' : 
                   item.status === 'decoding' ? 'Decoding...' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addButton} 
            onPress={addNewUrl}
          >
            <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.addButtonText}>Add URL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  urlContainer: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  removeButton: {
    marginLeft: 10,
  },
  button: {
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default FullScreenWebView;
