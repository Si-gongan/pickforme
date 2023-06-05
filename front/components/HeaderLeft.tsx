import React from 'react';
import { useRouter } from "expo-router";
import { View, Text } from './Themed';
import { HeaderBackButtonProps } from '@react-navigation/native-stack/src/types';
import Button from './Button';
import { Image, StyleSheet, Pressable, useColorScheme } from 'react-native';

const HeaderLeft: React.FC<HeaderBackButtonProps> = (props) => {
  const router = useRouter();
  if (props.canGoBack) {
    return (
      <Button
        title='뒤로가기'
        color='tertiary'
        size='small'
        onPress={() => router.back()}
        style={styles.backButton}
        textStyle={styles.backText}
      />
    );
  }
  return (
    <View style={styles.logoWrap}>
      <Image style={styles.logoImage} source={require('../assets/images/icon.png')} />
      <Text style={styles.logoText}>
        픽포미
      </Text>
    </View>
  );
}

export default HeaderLeft;

const styles = StyleSheet.create({
  backWrap: {},
  backButton: { width: 89 },
  backText: {
    textDecorationLine: 'underline',
  },
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
