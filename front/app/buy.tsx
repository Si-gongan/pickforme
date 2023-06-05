import { ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';

import Button from '../components/Button';
import { Text, View } from '../components/Themed';

export default function BuyScreen() {
  const router = useRouter();
  const userData = useAtomValue(userDataAtom);
  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text>
      buy (TBD)
      </Text>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
