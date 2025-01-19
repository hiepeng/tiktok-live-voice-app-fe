import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onClearComments: () => void;
  isTTSEnabled: boolean;
  onToggleTTS: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  visible,
  onClose,
  onClearComments,
  isTTSEnabled,
  onToggleTTS,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => {
              onToggleTTS();
              onClose();
            }}
          >
            <Ionicons 
              name={isTTSEnabled ? "volume-mute-outline" : "volume-high-outline"} 
              size={24} 
              color="#000" 
            />
            <Text style={styles.modalButtonText}>
              {isTTSEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalButton, styles.deleteButton]}
            onPress={() => {
              onClearComments();
              onClose();
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
            <Text style={[styles.modalButtonText, styles.deleteText]}>
              Clear Comments
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  deleteButton: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deleteText: {
    color: '#ff4444',
  },
});

export default OptionsModal; 