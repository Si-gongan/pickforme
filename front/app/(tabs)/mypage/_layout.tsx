import React from 'react';
import { useRouter, Stack } from 'expo-router';
import HeaderLeft from '../../../components/HeaderLeft';

const hideHeaderOption = {
  headerShadowVisible: false, // applied here
  headerTitle: '',
  headerLeft: HeaderLeft,
}

export default function HowStackLayout() {
  const router = useRouter();
  return (
    <Stack>
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
