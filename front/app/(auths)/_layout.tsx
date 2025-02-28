import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useAtomValue } from "jotai";

import { userDataAtom } from "@stores";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userData = useAtomValue(userDataAtom);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
