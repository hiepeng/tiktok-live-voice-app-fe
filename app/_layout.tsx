import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useUserStore } from "../store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { token, validateToken } = useUserStore();
  const segments = useSegments();
  const router = useRouter();
  const [isValidated, setIsValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Chỉ validate token một lần khi app khởi động
  useEffect(() => {
    const validateOnLaunch = async () => {
      try {
        if (token && !isValidated) {
          const isValid = await validateToken();
          setIsValidated(true);

          if (!isValid) {
            await AsyncStorage.removeItem("token");
            setIsLoading(false);
            return;
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateOnLaunch();
  }, [token]);

  // Kiểm tra route protection sau khi đã load xong
  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === "auth";
      if (!token && !inAuthGroup) {
        router.replace("/auth/login");
      }
    }
  }, [segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return <Slot />;
}
