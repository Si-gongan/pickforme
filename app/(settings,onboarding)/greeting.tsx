import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Image } from 'react-native';
import { useAtom } from 'jotai';

import Button from '../../components/Button';

import { Text, View } from '../../components/Themed';
import { settingAtom } from '../../stores/auth/atoms';

export default function GreetingScreen() {
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();
  const handleSubmit = () => {
    setSetting({ ...setting, isReady: true })
    router.push('/(tabs)');
  }
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image style={styles.hand} source={require('../../assets/images/onboarding/hand.png')} />
        <Text style={styles.desc}>설정 완료!</Text>
        <Text style={styles.title}>{setting.name}님,</Text>
        <Text style={styles.title}>반갑습니다!</Text>
      </View>
      <View style={styles.buttonWrap}>
        <Button title='확인' onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrap: {
    width: '100%',
    padding: 31,
  },
  hand: {
    width: 100,
    height: 100,
    marginBottom: 59,
  },
  desc:{
    marginBottom: 59,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '600',
  }
});
