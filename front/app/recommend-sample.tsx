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
{`요구사항에 맞는 최적의 상품 3개를 찾아드려요. 
1) 원하는 상품과 가격대 
2) 원하는 상품의 특징을 자유롭게 적어주세요.
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
            <Text style={styles.desc}>
            5만원대 가디건) 여성용 버건디색 M사이즈로, 무난하게 입을 수 있는 제품이면 좋겠어요.
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.desc, styles.dot]}>
              {`\u2022`}
            </Text>
            {/* @ts-ignore */}
            <Text style={styles.desc}>
            50만원 노트북) 흰색 13인치로, 학교 수업에서 사용할 예정이라 무겁지 않고 얇은 상품을 원해요.</Text>
          </View>
          <View style={{height:20}}></View>
          <View style={styles.row}>
            {/* @ts-ignore */}
            <Text style={styles.desc}>
            자세하게 의뢰서를 작성해주시면 마음에 쏙 드는 상품을 추천드릴 수 있어요 🙂</Text>
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
