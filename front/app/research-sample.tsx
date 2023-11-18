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
          분석 의뢰 작성 방법
        </Text>
        <Text style={styles.desc}>
{`픽포미 분석에서는 접근성이 낮은 상품 페이지를 꼼꼼히 설명해드려요! 궁금한 상품의 링크를 붙여넣고, 그 밑의 입력창에 상품에 대해 알고 싶은 점을 적어주세요.
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
화장품) 상품 이름에는 안 적혀 있어서, 구체적인 성분이 궁금해요.
  </Text>
</View>
<View style={styles.row}>
  <Text style={[styles.desc, styles.dot]}>
    {`\u2022`}
  </Text>
  {/* @ts-ignore */}
  <Text style={styles.desc} lineBreakStrategyIOS='hangul-word'>
옷) 버건디 가디건인데, 혹시 많이 진한 색인가요?</Text>
</View>
<View style={styles.row}>
  <Text style={[styles.desc, styles.dot]}>
    {`\u2022`}
  </Text>
  {/* @ts-ignore */}
  <Text style={styles.desc} lineBreakStrategyIOS='hangul-word'>
전자제품) 가습기의 가로 세로 높이 사이즈가 궁금해요.</Text>
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
