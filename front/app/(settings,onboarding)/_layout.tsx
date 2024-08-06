import React from 'react';
import { useRouter, Redirect } from 'expo-router';
import { useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';
import { Stack } from 'expo-router';

const SCREENS = ['nickname', 'intro', 'theme', 'notification'];
export default function TabLayout(params: any) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const setting = useAtomValue(settingAtom);

  const { segment } = params;
  if (setting.isReady && segment === '(onboarding)') {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <Stack>
      {SCREENS.map(name => (
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
