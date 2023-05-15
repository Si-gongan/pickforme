import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import { Button } from 'react-native';

import { Text, View } from '../components/Themed';
import { userDataAtom } from '../stores/auth/atoms';

export default function RegisterScreen() {
  const [userData, setUserData] = useAtom(userDataAtom);
  const router = useRouter();

  React.useEffect(() => {
    if (userData) {
      router.replace('(tabs)');
    }
  }, [userData]);
  if (userData) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Button onPress={() => setUserData(true)} title='Login' />
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
