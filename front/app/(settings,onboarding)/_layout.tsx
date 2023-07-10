import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, Link, Tabs, Redirect } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';
import { Stack } from 'expo-router';

import { Text } from '../../components/Themed';

import Colors from '../../constants/Colors';

const SCREENS = ['nickname', 'intro', 'fontSize', 'theme', 'greeting'];
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
        />
      ))}
    </Stack>
  );
}
