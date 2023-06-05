import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import { Stack } from 'expo-router';

import { useAtomValue } from 'jotai';
import { Text } from '../../components/Themed';
import { userDataAtom } from '../../stores/auth/atoms';

import Colors from '../../constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const userData = useAtomValue(userDataAtom);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
