import React from 'react';
import { useRouter, Link, Tabs, Redirect } from 'expo-router';
import { StyleSheet, Image, Pressable, Text } from 'react-native';

import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';

import { View } from '../../components/Themed';
import { hexToRgb } from '../../utils/common';
import Colors from '../../constants/Colors';
import HeaderLeft from '../../components/HeaderLeft';

import IndexIcon from '../../assets/images/tabbar/index.svg';
import DiscoverIcon from '../../assets/images/tabbar/discover.svg';
import RequestsIcon from '../../assets/images/tabbar/requests.svg';
import MypageIcon from '../../assets/images/tabbar/mypage.svg';
import useColorScheme from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const setting = useAtomValue(settingAtom);

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
          borderTopLeftRadius: 17,
          borderTopWidth: 0,
          borderTopRightRadius: 17,
          paddingBottom: 30,
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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IndexIcon style={{color}} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/notice')} accessibilityLabel='공지사항' accessibilityRole='button'>
            <Image
              style={styles.notice}
              source={require('../../assets/images/main/notice.png')}
            />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="AI"
        options={{
          headerShown: false, 
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
          title: '마이페이지',
          tabBarIcon: ({ color }) => <MypageIcon style={{color}} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  notice: {
    width: 25,
    height: 25,
    marginRight: 27,
  },
});

