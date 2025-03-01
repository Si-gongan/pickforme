import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";

import { settingAtom } from "@stores";

const SCREENS = ["nickname", "intro", "theme", "notification"];
export default function TabLayout(params: any) {
  const setting = useAtomValue(settingAtom);

  const { segment } = params;
  if (setting.isReady && segment === "(onboarding)") {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <Stack>
      {SCREENS.map((name) => (
        <Stack.Screen
          key={`setting-stack-screen-${name}`}
          name={name}
          options={{ headerShown: false }}
          initialParams={{ segment }}
        />
      ))}
    </Stack>
  );
}
