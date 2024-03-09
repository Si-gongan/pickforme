import { ImageSourcePropType, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { settingAtom } from '../../stores/auth/atoms';
import useCheckLogin from '../../hooks/useCheckLogin';

import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import Colors from '../../constants/Colors';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';

import { useFocusEffect } from '@react-navigation/core';
import { useRef, useCallback } from 'react';
import { Text as TextBase, AccessibilityInfo, findNodeHandle } from 'react-native';
import MypageIcon from '../../assets/images/tabbar/index.svg';


interface TDATA {
  path: string;
  title: string;
  image: ImageSourcePropType;
  label: string;
  requireAuth: boolean;
}
const DATA: TDATA[] = [{
  path: '/(tabs)/discover',
  title: `상품\n검색하기`,
  label: '상품 검색하기',
  image: require('../../assets/images/main/discover.png'),
  requireAuth: true,
}, {
  path: '/chat',
  title: `포미와\n쇼핑하기`,
  label: '포미와 쇼핑하기',
  image: require('../../assets/images/main/AI.png'),
  requireAuth: true,
}, {
  path: '/recommend',
  title: `상품\n추천받기`,
  label: `상품 추천받기`,
  image: require('../../assets/images/main/recommend.png'),
  requireAuth: true,
}, {
  path: '/research',
  title: `상품\n설명받기`,
  label: `상품 설명받기`,
  image: require('../../assets/images/main/research.png'),
  requireAuth: true,
}];

export default function TabOneScreen() {
  const router = useRouter();
    const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);

  const setting = useAtomValue(settingAtom);
  const onPress = (id: string) => {
    router.push(id);
  }
  const onPressWithCheckLogin = useCheckLogin((id: string) => {
    onPress(id);
  });
  const headerTitleRef = useRef<TextBase>(null);
  useFocusEffect(
    useCallback(() => {
      if (headerTitleRef.current) {
        const nodeHandle = findNodeHandle(headerTitleRef.current);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        }
      }
    }, [])
    );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MypageIcon style={styles.icon} />
          <Text style={styles.headerTitle} ref={headerTitleRef} accessibilityRole='header'>홈</Text>
        </View>
        <Pressable onPress={() => router.push('/notices')} accessibilityLabel='공지사항' accessibilityRole='button'>
            <Image
              style={styles.notice}
              source={require('../../assets/images/main/notice.png')}
            />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.inner}>
          <View style={{height:60}}></View>
          <View style={styles.save}>
            <FlatList<TDATA>
              scrollEnabled={false}
              contentContainerStyle={styles.list}
              data={DATA.slice(0,1)}
              numColumns={1}
              // columnWrapperStyle={styles.row}
              renderItem={({ item, index }) => (
                <Button
                  onPress={() => item.requireAuth ? onPressWithCheckLogin(item.path) : onPress(item.path)}
                  style={[styles.button, styles.buttonCenter]}
                  textStyle={styles.text}
                  title={item.title}
                  accessibilityLabel={item.label}
                  accessibilityRole='button'
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
          <Text style={styles.subtitle}>
            나만을 위한 맞춤 서비스를 받아보세요
          </Text>
          <View style={styles.save}>
          <FlatList<TDATA>
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            data={DATA.slice(2)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item, index }) => (
              <Button
                onPress={() => item.requireAuth ? onPressWithCheckLogin(item.path) : onPress(item.path)}
                style={[styles.button, index % 2 ? styles.buttonRight : styles.buttonLeft]}
                textStyle={styles.text}
                title={item.title}
                accessibilityLabel={item.label}
                accessibilityRole='button'
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

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 0,
    alignSelf: 'center',
  },
  textWrap: {
    textAlign: 'left',
    marginBottom: 53,
    width: '100%',
  },
  image: {
    position: 'absolute',
    right: 17,
    top: 15,
    width: 38,
    height: 38,
  },
  save: {
    marginBottom:80,
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
    alignItems: 'flex-start',
    width: 149,
    height: 108,
    paddingLeft: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowColor: 'rgb(17, 30, 79)',
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  buttonCenter: {
    width: 316,
  },
  buttonLeft: {
    marginRight: 9,
  },
  buttonRight: {
    marginLeft: 9,
  },
  text: {
    textAlign: 'left',
    marginTop: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    textAlign: 'left',
    width: '100%',
    lineHeight: 27,
    fontWeight: '600',
  },
  subtitle: {
    width: '100%',
    textAlign: 'left',
    marginBottom:20,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }, 
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: Colors[colorScheme].text.primary,
    marginRight: 9,
  },
  headerTitle: {
       fontWeight: '600',
    fontSize: 22,
    lineHeight: 27,
  },
  notice: {
    width: 25,
    height: 25,
    marginRight: 27,
  },
});
