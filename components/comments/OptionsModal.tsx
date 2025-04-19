import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, Pressable, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  isSpeaking: boolean;
  onToggleSpeaking: () => void;
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

const MAX_HEIGHT = Dimensions.get('window').height * 0.6;

export const OptionsModal: React.FC<OptionsModalProps> = ({
  visible,
  onClose,
  isSpeaking,
  onToggleSpeaking,
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalButton}
            onPress={onToggleSpeaking}
          >
            <Ionicons 
              name={isSpeaking ? "volume-mute-outline" : "volume-high-outline"} 
              size={24} 
              color="#000" 
            />
            <Text style={styles.buttonText}>
              {isSpeaking ? 'Turn OFF automatic comment reading' : 'Turn ON automatic comment reading'}
            </Text>
          </TouchableOpacity>
          {isSpeaking && (
            <View style={styles.languageSection}>
              <Text style={styles.languageLabel}>TTS Language:</Text>
              <View style={[styles.pickerContainer, { maxHeight: MAX_HEIGHT }]}> 
                <FlatList
                  data={LANGUAGES}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.languageOption,
                        selectedLanguage === item.value && styles.selectedLanguageOption,
                      ]}
                      onPress={() => onLanguageChange(item.value)}
                    >
                      <Text style={selectedLanguage === item.value ? styles.selectedLanguageText : styles.languageText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
    alignSelf: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
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
  languageOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedLanguageOption: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: 'bold',
  },
});

export default OptionsModal; 