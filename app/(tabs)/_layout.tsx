import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, Link, Tabs } from 'expo-router';
import { Image, StyleSheet, Pressable, useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai';
import { View, Text } from '../../components/Themed';
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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint.primary,
        headerShadowVisible: false, // applied here
        headerStyle: {
          height: 100,
        },
        headerLeft: () => (
          <View style={styles.logoWrap}>
            <Image style={styles.logoImage} source={require('../../assets/images/icon.png')} />
            <Text style={styles.logoText}>
              픽포미
            </Text>
          </View>
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


const styles = StyleSheet.create({
  logoWrap: {
    flexDirection: 'row',
    marginLeft: 27,
  },
  logoImage: {
    width: 29.32,
    height: 28,
  },
  logoText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 29,
  },
});
