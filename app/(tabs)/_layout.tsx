import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const dimensions = useWindowDimensions();
  const isSmallScreen = dimensions.width < 768;

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const fetchToken = async () => {
        try {
          const storedToken = await AsyncStorage.getItem("token");
          setToken(storedToken);
        } catch (error) {
          setToken(null);
        } finally {
          setLoading(false);
        }
      };
      fetchToken();
    } catch (error) {
      console.error("Failed to fetch token:", error);
      setToken(null);
      setLoading(false);
    }
  }, []);
  if (loading) {
    return null;
  }
  if (!token) {
    return null;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0a7ea4",
          tabBarLabelPosition: isSmallScreen ? "below-icon" : "beside-icon",
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="comments"
          options={{
            title: "Comments",
            tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="packages"
          options={{
            title: "Packages",
            tabBarIcon: ({ color }) => <MaterialIcons name="shopping-cart" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
