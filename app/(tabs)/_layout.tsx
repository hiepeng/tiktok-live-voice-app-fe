import { Tabs } from "expo-router";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const dimensions = useWindowDimensions();
  const isSmallScreen = dimensions.width < 768;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0a7ea4",
          tabBarLabelPosition: isSmallScreen ? 'below-icon' : 'beside-icon',
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
            tabBarIcon: ({ color }) => <MaterialIcons name="shopping-cart" size={24} color={color} />
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
