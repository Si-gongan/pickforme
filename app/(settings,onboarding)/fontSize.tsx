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

export default function FontSizeScreen(params: Params) {
  const [setting, setSetting] = useAtom(settingAtom);
  const router = useRouter();
  const [value, setValue] = React.useState(setting.fontSize ??' small');

  const handleSubmit = () => {
    setSetting({
      ...setting,
      fontSize: value as typeof setting['fontSize'],
    });
    if (params.segment === '(onboarding)') {
      router.push('intro');
    } else {
      router.back();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>글자 크기를 선택해주세요.</Text>
        {['small','medium','large'].map((size) => (
        <View style={styles.row} key={`Onboard-fontSize-${size}`}>
          <Text style={[styles.label, styles[size as keyof typeof styles]]}>{size}</Text>
          <RadioButton.Android
            color={Colors.light.buttonBackground.primary}
            value={size}
            status={value === size ? 'checked' : 'unchecked'}
            onPress={() => setValue(size)}
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
