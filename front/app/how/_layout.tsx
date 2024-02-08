import React from 'react';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Themed';

import { Stack } from 'expo-router';
import HeaderLeft from '../../components/HeaderLeft';

import { SCREENS } from './constants';

const hideHeaderOption = {
  headerShadowVisible: false, // applied here
  headerTitle: () => <Text accessible={false} />,
  headerBackVisible: false,
  headerLeft: HeaderLeft,
}

export default function HowStackLayout() {
  const router = useRouter();
  return (
    <Stack>
      {SCREENS.map((name) => (
        <Stack.Screen
          key={`how-stack-screen-${name}`}
          name={name}
          options={hideHeaderOption}
        />
      ))}
    </Stack>
  );
}
