import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';
import { RadioButton } from 'react-native-paper';

import Colors from '../../constants/Colors';
import { Text, View } from '../../components/Themed';
import { settingAtom } from '../../stores/auth/atoms';
import { Params } from './_types';

export default function ThemeScreen(params: Params) {
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();
  const [theme, setTheme] = React.useState<string>(setting.theme ?? 'default');

  const handleSubmit = () => {
    setSetting({
      ...setting,
      theme: theme as typeof setting['theme'],
    });
    if (params.segment === '(onboarding)') {
      router.push('greeting');
    } else {
      router.back();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>화면 모드를 선택해주세요.</Text>
        {['default', 'light', 'dark'].map((key) => (
        <View style={styles.row} key={`Onboard-theme-${key}`}>
          <Text style={styles.label}>{key}</Text>
          <RadioButton.Android
            color={Colors.light.buttonBackground.primary}
            value={key}
            status={key === theme ? 'checked' : 'unchecked'}
            onPress={() => setTheme(key)}
          />
        </View>
        ))}
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
    marginBottom: 30,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrap: {
    width: '100%',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 70,
    paddingRight: 67,
    paddingTop: 62,
  },
  label: {
    flex: 1,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
  },
});
