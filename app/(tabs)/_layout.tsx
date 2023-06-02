import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, Link, Tabs, Redirect } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';

import { hexToRgb } from '../../utils/common';
import Colors from '../../constants/Colors';
import HeaderLeft from '../../components/HeaderLeft';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

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
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          /*
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
          */
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'AI 포미',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false, 
          title: '의뢰 목록',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
