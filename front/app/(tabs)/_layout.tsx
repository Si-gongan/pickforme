import React from 'react';
import { useRouter, Link, Tabs, Redirect } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';

import { hexToRgb } from '../../utils/common';
import Colors from '../../constants/Colors';
import HeaderLeft from '../../components/HeaderLeft';

import IndexIcon from '../../assets/images/tabbar/index.svg';
import DiscoverIcon from '../../assets/images/tabbar/discover.svg';
import RequestsIcon from '../../assets/images/tabbar/requests.svg';
import MypageIcon from '../../assets/images/tabbar/mypage.svg';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const setting = useAtomValue(settingAtom);

  if (!setting.isReady) {
    return <Redirect href="(onboarding)/fontSize" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].buttonBackground.primary,
          borderTopLeftRadius: 17,
          borderTopRightRadius: 17,
          paddingBottom: 30,
          height: 84,
        },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].buttonText.primary,
        tabBarInactiveTintColor: `rgba(${hexToRgb(Colors[colorScheme ?? 'light'].buttonText.primary)}, 0.7)`,
        headerShadowVisible: false, // applied here
        headerStyle: {
          height: 100,
          backgroundColor: Colors[colorScheme ?? 'light'].background.primary,
        },
        headerLeft: () => <HeaderLeft canGoBack={false} />,
        headerTintColor: 'transparent',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IndexIcon style={{color}} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'AI 포미',
          tabBarIcon: ({ color }) => <DiscoverIcon style={{color}} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          headerShown: false, 
          title: '의뢰 목록',
          tabBarIcon: ({ color }) => <RequestsIcon style={{color}} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          headerShown: false, 
          title: '마이페이지',
          tabBarIcon: ({ color }) => <MypageIcon style={{color}} />,
        }}
      />
    </Tabs>
  );
}
