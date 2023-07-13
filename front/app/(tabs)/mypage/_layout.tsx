import React from 'react';
import { useRouter, Stack } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import HeaderLeft from '../../../components/HeaderLeft';
import Colors from '../../../constants/Colors';

const hideHeaderOption = {
  headerShadowVisible: false, // applied here
  headerTitle: '',
  headerLeft: HeaderLeft,
}

export default function HowStackLayout() {
  const router = useRouter();
    const colorScheme = useColorScheme();


  return (
    <Stack
     screenOptions={{
       headerShown: false,
     }}
    >
      {['index', 'how', 'notification'].map((name) => (
        <Stack.Screen
          key={`mypage-stack-screen-${name}`}
          name={name}
          options={hideHeaderOption}
        />
      ))}
    </Stack>
  );
}
