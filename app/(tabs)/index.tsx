import { StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '../../components/Themed';

export default function TabOneScreen() {
  const router = useRouter();
  const onPress = (id: string) => {
    router.push(id);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>곰지님 안녕하세요, 좋은 하루입니다!</Text>
      <Text style={styles.title}>픽포미 쇼핑 도우미 서비스를 이용해보세요.</Text>
      <View style={styles.save}>
      <FlatList<string>
        contentContainerStyle={styles.list}
        data={['recommend', 'research', 'buy', 'AI']}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPress(item)}>
            <View style={styles.view}>
              <Text style={styles.text}>{item}</Text>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item}
      />
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
  save: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  view: {
    backgroundColor: '#111E4F',
    flexDirection: 'column',
    margin: 12,
    width: 122,
    height: 172,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowColor: 'rgba(17, 30, 79)',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    color: '#e9e9e9',
    marginTop: 12,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
  },
  row: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
