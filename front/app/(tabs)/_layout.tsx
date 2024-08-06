import React from 'react';
import { useRouter, Link, Tabs, Redirect } from 'expo-router';
import { StyleSheet, Image, Pressable, Text } from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';
import { tabNavigationAtom } from '../../stores/layout/atoms';

import { hexToRgb } from '../../utils/common';
import Colors from '../../constants/Colors';
import HeaderLeft from '../../components/HeaderLeft';

import IndexIcon from '../../assets/images/tabbar/index.svg';
import MypageIcon from '../../assets/images/tabbar/mypage.svg';
import RequestsIcon from '../../assets/images/tabbar/requests.svg';
import useColorScheme from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const setting = useAtomValue(settingAtom);
  const setTabNavigation = useSetAtom(tabNavigationAtom);

  if (!setting.isReady) {
    return <Redirect href="(onboarding)/nickname" />;
  }

  return (
    <Tabs
      sceneContainerStyle={{
        paddingBottom: 84,
        backgroundColor: Colors[colorScheme].background.primary,
      }}
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Colors[colorScheme].buttonBackground.primary,
          borderTopWidth: 0,
          paddingTop: 10,
          paddingBottom: 20,
          height: 84,
        },
        headerTitle: () => <Text accessible={false} />,
        headerStyle: {
          backgroundColor: Colors[colorScheme].background.primary,
        },
        tabBarActiveTintColor: Colors[colorScheme].buttonText.primary,
        tabBarInactiveTintColor: `rgba(${hexToRgb(Colors[colorScheme].buttonText.primary)}, 0.7)`,
        headerShadowVisible: false, // applied here
        headerLeft: () => <HeaderLeft canGoBack={false} />,
        headerTintColor: 'transparent',
      }}
      screenListeners={{
        tabPress: (e) => {
          const nav = e.target?.split('-')[0];
          if (nav) {
            setTabNavigation(nav);
          }
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false, 
          title: '홈',
          tabBarAccessibilityLabel: '홈 탭',
          tabBarIcon: ({ color }) => <IndexIcon style={{color}} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          headerShown: false, 
          title: '위시리스트',
          tabBarAccessibilityLabel: '위시리스트 탭',
          tabBarIcon: ({ color }) => <RequestsIcon style={{color}} />,
        }}   
      />

      <Tabs.Screen
        name="mypage"
        options={{
          headerShown: false, 
          title: '마이페이지',
          tabBarAccessibilityLabel: '마이페이지 탭',
          tabBarIcon: ({ color }) => <MypageIcon style={{color}} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
});

