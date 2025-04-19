import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

let showToastFn: (options: ToastOptions) => void = () => {};

// Overload signature: showToast(message, success?, duration?)
export function showToast(
  messageOrOptions: string | ToastOptions,
  success?: boolean,
  duration?: number
): void;
export function showToast(options: ToastOptions): void;
export function showToast(
  messageOrOptions: string | ToastOptions,
  success?: boolean,
  duration?: number
): void {
  if (typeof messageOrOptions === 'string') {
    showToastFn({
      message: messageOrOptions,
      type: success === false ? 'error' : 'success',
      duration: duration,
    });
  } else {
    showToastFn(messageOrOptions);
  }
}

const ICONS = {
  error: { name: 'error-outline', color: '#fff' },
  success: { name: 'check-circle', color: '#fff' },
  info: { name: 'info-outline', color: '#fff' },
};

export const ToastRoot: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<ToastType>('info');
  const translateX = React.useRef(new Animated.Value(-400)).current;

  React.useEffect(() => {
    showToastFn = ({ message, type = 'info', duration = 3000 }) => {
      setMessage(message);
      setType(type);
      setVisible(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(translateX, {
            toValue: 400,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setVisible(false);
            translateX.setValue(-400);
          });
        }, duration);
      });
    };
  }, [translateX]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        styles[type],
        {
          transform: [{ translateX }],
          top: 60,
          bottom: undefined,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 16.0,
          elevation: 10,
        },
      ]}
    >
      <View style={styles.row}>
        <MaterialIcons
          name={ICONS[type].name as any}
          size={24}
          color={ICONS[type].color}
          style={styles.icon}
        />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 9999,
    alignItems: 'center',
    minHeight: 56,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16.0,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  error: {
    backgroundColor: '#E53935',
  },
  success: {
    backgroundColor: '#43A047',
  },
  info: {
    backgroundColor: '#1976D2',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
});
