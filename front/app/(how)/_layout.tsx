import React from 'react';
import { useRouter } from 'expo-router';

import { Stack } from 'expo-router';

import { SCREENS } from './constants';
export default function HowStackLayout() {
  const router = useRouter();
  return (
    <Stack>
      {SCREENS.map((name) => (
        <Stack.Screen
          key={`how-stack-screen-${name}`}
          name={name}
          options={{ headerShown: false }}
        />
      ))}
    </Stack>
  );
}
