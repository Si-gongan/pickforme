import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai';
import { Text } from '../../components/Themed';
import { userDataAtom } from '../../stores/auth/atoms';

import Colors from '../../constants/Colors';

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
  const userData = useAtomValue(userDataAtom);

  React.useEffect(() => {
    if (!userData) {
      router.replace('register');
    }                 
  }, [userData]);             
  if (!userData) {     
    return null;
  }                   

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShadowVisible: false, // applied here
        headerStyle: {
        },
        headerLeft: () => (
          <Text>
            픽포미
          </Text>
        ),
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
