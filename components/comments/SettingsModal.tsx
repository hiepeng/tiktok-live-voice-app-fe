import React, { useState, useCallback } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import debounce from "lodash/debounce";
import { useCommentStore } from '@/store/useCommentStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}: SettingsModalProps) => {
  const { maxComments, setMaxComments, clearComments } = useCommentStore();
  const [localValue, setLocalValue] = useState(maxComments);

  // Debounced function để cập nhật giá trị thực và lưu vào storage
  const debouncedUpdate = useCallback(
    debounce(async (value: number) => {
      console.log(value, "setMaxComments");
      await setMaxComments(value);
    }, 500),
    []
  );

  // Cập nhật giá trị local ngay lập tức để UI phản hồi nhanh
  const handleValueChange = (value: number) => {
    const roundedValue = Math.round(value);
    setLocalValue(roundedValue);
    debouncedUpdate(roundedValue);
  };

  // Reset local value khi modal mở
  React.useEffect(() => {
    if (visible) {
      setLocalValue(maxComments);
    }
  }, [visible, maxComments]);

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </Pressable>
          </View>

          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Maximum Comments: {localValue}</Text>
            <Slider
              style={styles.slider}
              minimumValue={20}
              maximumValue={3000}
              value={localValue}
              onValueChange={handleValueChange}
              step={1}
              minimumTrackTintColor="#4c669f"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#4c669f"
            />
          </View>

          <TouchableOpacity 
            style={[styles.modalButton, styles.deleteButton]}
            onPress={() => {
              clearComments();
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "80%",
    maxWidth: 300,
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
  settingSection: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
  deleteText: {
    color: "#ff4444",
  },
});

export default SettingsModal;