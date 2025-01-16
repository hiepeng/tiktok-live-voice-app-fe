import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useUserStore } from '../store/useUserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const { token, validateToken } = useUserStore();
  const segments = useSegments();
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);

  // Chỉ validate token một lần khi app khởi động
  useEffect(() => {
    console.log("check")
    const validateOnLaunch = async () => {
      if (token && !isValidated) {
        const isValid = await validateToken();
        setIsValidated(true);

        if (!isValid) {
          router.replace('/auth/login');
          await AsyncStorage.removeItem('token');
        }
      }
    };

    validateOnLaunch();
  }, []);

  // Kiểm tra route protection mà không validate token
  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    if (!token && !inAuthGroup) {
      router.replace('/auth/login');
    }
  }, [segments]);

  return <Slot />;
}
