import { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import { Linking } from "react-native";
import { useUserStore } from "../store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastRoot } from "../components/Toast";

export default function RootLayout() {
  const router = useRouter();
  const validateToken = useUserStore(state => state.validateToken);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const valid = await validateToken();
      if (!valid) {
        router.replace("/auth/login");
      }
    };
    
    checkAuthAndRedirect();

    // Xử lý deep linking
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;

      if (url.includes("auth")) {
        const token = url.split("token=")[1];
        if (token) {
          handleAuthToken(token);
        }
      }
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAuthToken = async (token: string) => {
    console.log("deep link")
    try {
      await AsyncStorage.setItem("token", token);
      const res = await validateToken();
      if (res) {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error handling auth token:", error);
    }
  };

  return (
    <>
      <Slot />
      <ToastRoot />
    </>
  );
}
