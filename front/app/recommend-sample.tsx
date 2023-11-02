import { ScrollView, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { Text, View } from '../components/Themed';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';

export default function RequestScreen() {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.inner}>
        <Text style={styles.title}>
          추천 의뢰 작성 방법
        </Text>
        <Text style={styles.desc}>
{`1) 상품 종류
2) 상품과 연관된 고객님의 특징
3) 상품 선택 시 고려하시는 부분을 작성해 주세요!
자세한 설명을 적어주시면 마음에 쏙 드는 상품을 추천드릴게요 🙂
`}
</Text>
<Text style={styles.subtitle}>
작성 예시
</Text>
<View style={styles.row}>
  <Text style={[styles.desc, styles.dot]}>
    {`\u2022`}
  </Text>
  {/* @ts-ignore */}
  <Text style={styles.desc} lineBreakStrategyIOS='hangul-word'>
화장품) 파운데이션. 21호 지성피부고, 커버력이 좋은 상품을 원해요!
  </Text>
</View>
<View style={styles.row}>
  <Text style={[styles.desc, styles.dot]}>
    {`\u2022`}
  </Text>
  {/* @ts-ignore */}
  <Text style={styles.desc} lineBreakStrategyIOS='hangul-word'>
옷) 버건디 가디건. 저는 여성이고, 주로 M사이즈를 입습니다. 무난하게 입을 상품을 원해요!</Text>
</View>
<View style={styles.row}>
  <Text style={[styles.desc, styles.dot]}>
    {`\u2022`}
  </Text>
  {/* @ts-ignore */}
  <Text style={styles.desc} lineBreakStrategyIOS='hangul-word'>
전자제품) 흰색 13인치 노트북. 학교 수업에서 사용할 예정이라, 무겁지 않고 얇은 상품을 원해요!</Text>
</View>
</View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 25,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  desc: {
    fontSize: 16,
    flexGrow: 1,
  },
  dot: {
    flexShrink: 0,
    width: 16,
  },
  row: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingRight: 24,
    width: '100%',
  },
});
