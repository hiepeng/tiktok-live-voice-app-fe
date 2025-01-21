import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onClearComments: () => void;
  isTTSEnabled: boolean;
  onToggleTTS: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

// Language tags follow IETF BCP 47 standard
// Reference: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
const LANGUAGES = [
  { label: 'Arabic (Saudi Arabia)', value: 'ar-SA' },
  { label: 'Chinese (Mandarin, Simplified)', value: 'cmn-Hans-CN' },
  { label: 'Chinese (Mandarin, Traditional)', value: 'cmn-Hant-TW' },
  { label: 'Czech', value: 'cs' },
  { label: 'Danish', value: 'da' },
  { label: 'Dutch', value: 'nl' },
  { label: 'English (Australia)', value: 'en-AU' },
  { label: 'English (United Kingdom)', value: 'en-GB' },
  { label: 'English (United States)', value: 'en-US' },
  { label: 'Finnish', value: 'fi' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de' },
  { label: 'Greek', value: 'el' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Malay', value: 'ms' },
  { label: 'Norwegian Bokmål', value: 'nb' },
  { label: 'Polish', value: 'pl' },
  { label: 'Portuguese (Brazil)', value: 'pt-BR' },
  { label: 'Portuguese (Portugal)', value: 'pt-PT' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Spanish (Mexico)', value: 'es-MX' },
  { label: 'Spanish (Spain)', value: 'es-ES' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Thai', value: 'th' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Vietnamese', value: 'vi' }
].sort((a, b) => a.label.localeCompare(b.label));

export const OptionsModal: React.FC<OptionsModalProps> = ({
  visible,
  onClose,
  onClearComments,
  isTTSEnabled,
  onToggleTTS,
  selectedLanguage,
  onLanguageChange,
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
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={() => {
              onToggleTTS();
            }}
          >
            <Ionicons 
              name={isTTSEnabled ? "volume-mute-outline" : "volume-high-outline"} 
              size={24} 
              color="#000" 
            />
            <Text style={styles.modalButtonText}>
              {isTTSEnabled ? 'Turn OFF automatic comment reading' : 'Turn ON automatic comment reading'}
            </Text>
          </TouchableOpacity>

          {isTTSEnabled && (
            <View style={styles.languageSection}>
              <Text style={styles.languageLabel}>TTS Language:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLanguage}
                  onValueChange={onLanguageChange}
                  style={styles.picker}
                  dropdownIconColor="#000"
                  mode="dropdown"
                >
                  {LANGUAGES.map((lang) => (
                    <Picker.Item 
                      key={lang.value} 
                      label={lang.label} 
                      value={lang.value}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

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
  languageSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
  },
  pickerItem: {
    fontSize: 16,
    color: '#000',
  },
});

export default OptionsModal; 