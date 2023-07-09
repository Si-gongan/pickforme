import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';

import { Text, View } from '../../components/Themed';
import { settingAtom } from '../../stores/auth/atoms';

export default function RegisterScreen() {
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();

  const handleSubmit = () => {
    if (!setting.vision) {
      return;
    }
    const defaultSetting: {
      [key in typeof setting.vision]: {
        fontSize: typeof setting.fontSize,
        theme: typeof setting.theme,
      }
    } = {
      none: {
        fontSize: 'medium',
        theme: 'default',
      },
      low: {
        fontSize: 'large',
        theme: 'dark',
      },
      blind: {
        fontSize: 'medium',
        theme: 'light',
      },
    };
    setSetting({ ...defaultSetting[setting.vision], isReady: true })
    router.push('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>안녕하세요.</Text>
        <Text style={[styles.title, styles.title2]}>{`시각장애인을 위한\n쇼핑 서비스`}</Text>
        <View style={styles.textWrap}>
          <Text style={[styles.highlight, styles.desc]}>픽포미</Text><Text style={styles.desc}>에 오신 것을 환영합니다!</Text>
        </View>
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
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 27,
  },
  title2: {
    marginTop: 64,
    marginBottom: 34,
  },
  content: {
    flex: 1,
    paddingLeft: 55,
    paddingRight: 55,
    alignItems: 'flex-start',
    width: '100%',
    justifyContent: 'center',
  },
  buttonWrap: {
    width: '100%',
    padding: 31,
  },
  highlight: {
    fontWeight: '600',
  },
  desc: {
    fontSize: 18,
    lineHeight: 22,
  },
  textWrap: {
    flexDirection: 'row',
  },
});
