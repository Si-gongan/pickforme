import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HomeIcon, WishListIcon, MyIcon } from "@assets";
import { useColorScheme } from "@hooks";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "홈",
          tabBarAccessibilityLabel: "홈 탭",
          tabBarIcon: function ({ color }) {
            return <HomeIcon size={28} color={color} />;
          },
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "WishList",
          tabBarLabel: "위시리스트",
          tabBarAccessibilityLabel: "위시리스트 탭",
          tabBarIcon: function ({ color }) {
            return <WishListIcon size={28} color={color} />;
          },
        }}
      />

      <Tabs.Screen
        name="my"
        options={{
          title: "My",
          tabBarLabel: "마이페이지",
          tabBarAccessibilityLabel: "마이페이지 탭",
          tabBarIcon: function ({ color }) {
            return <MyIcon size={28} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
