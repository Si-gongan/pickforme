import { useRouter, usePathname } from "expo-router";
import React from "react";
import { StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';
import { RadioButton } from 'react-native-paper';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';

import Colors from '../../constants/Colors';
import { Text, View } from '../../components/Themed';
import { settingAtom } from '../../stores/auth/atoms';

const translationMap = {
  small: '작게',
  medium: '중간',
  large: '크게',
};

export default function FontSizeScreen() {
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();
  const pathname = usePathname();
  const isSetting = pathname.includes('settings');
  const colorScheme = useColorScheme();
  const [value, setValue] = React.useState(setting.fontSize ??' small');
  const handleSubmit = () => {
    setSetting({
      ...setting,
      fontSize: value as typeof setting['fontSize'],
    });
    if (isSetting) {
      router.back();
    } else {
      router.push('(onboarding)/intro');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>글자 크기를 선택해주세요.</Text>
        {Object.entries(translationMap).map(([size, label]) => (
        <View style={styles.row} key={`Onboard-fontSize-${size}`}>
          <Text style={[styles.label, styles[size as keyof typeof styles]]} accessible={false}>{label}</Text>
          <RadioButton.Android
            color={Colors[colorScheme].text.primary}
            value={size}
            status={value === size ? 'checked' : 'unchecked'}
            onPress={() => setValue(size)}
            accessibilityLabel={`${label} 선택 버튼`}
          />
        </View>
        ))}
      </View>
      <View style={styles.buttonWrap}>
        <Button title='확인' accessibilityLabel="확인버튼" onPress={handleSubmit} />
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
  },
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 20,
  }
});
