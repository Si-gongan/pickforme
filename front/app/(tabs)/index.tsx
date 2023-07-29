import { ImageSourcePropType, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';
import useCheckLogin from '../../hooks/useCheckLogin';

import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';

interface TDATA {
  path: string;
  title: string;
  image: ImageSourcePropType;
  requireAuth: boolean;
}
const DATA: TDATA[] = [{
  path: '/recommend',
  title: '픽포미 추천',
  image: require('../../assets/images/main/recommend.png'),
  requireAuth: true,
}, {
  path: '/research',
  title: '픽포미 분석',
  image: require('../../assets/images/main/research.png'),
  requireAuth: true,
}, {
  path: '/buy',
  title: '픽포미 구매',
  image: require('../../assets/images/main/buy.png'),
  requireAuth: true,
}, {
  path: '/how',
  title: `픽포미\n사용설명서`,
  image: require('../../assets/images/main/how.png'),
  requireAuth: false,
}];

export default function TabOneScreen() {
  const router = useRouter();
  const setting = useAtomValue(settingAtom);
  const onPress = (id: string) => {
    router.push(id);
  }
  const onPressWithCheckLogin = useCheckLogin((id: string) => {
    onPress(id);
  });
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={[styles.container, styles.scrollContainer]}>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{setting?.name}님 안녕하세요,</Text>
            <Text style={styles.title}>좋은 하루입니다!</Text>
            <Text style={styles.subtitle}>픽포미 쇼핑 도우미 서비스를 이용해보세요.</Text>
          </View>
          <View style={styles.save}>
          <FlatList<TDATA>
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            data={DATA}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <Button
                onPress={() => item.requireAuth ? onPressWithCheckLogin(item.path) : onPress(item.path)}
                style={styles.button}
                textStyle={styles.text}
                title={item.title}
                accessibilityLabel={`${item.title} 버튼`}
              >
                <Image
                  style={styles.image}
                  source={item.image}
                />
              </Button>
            )}
            keyExtractor={(item) => item.path}
          />
          </View>
        </View>
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
  scrollContainer: {
    paddingVertical: 25,
  },
  textWrap: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 39,
  },
  image: {
    width: 43,
    height: 43,
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
  button: {
    alignItems: 'center',
    margin: 12,
    width: 122,
    height: 172,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowColor: 'rgb(17, 30, 79)',
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  text: {
    textAlign: 'center',
    marginTop: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 21,
    fontSize: 16,
    lineHeight: 19,
  }
});
