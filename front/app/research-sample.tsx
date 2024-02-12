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
            설명 의뢰 작성 방법
          </Text>
          <Text style={styles.desc}>
            {`대체텍스트가 없는 상세페이지에 대해 꼼꼼하게 설명해 드려요. 상품의 링크를 붙여넣고 그 밑의 입력창에 궁금한 점을 자유롭게 적어주세요. 
            `}
          </Text>
          <Text style={styles.subtitle}>
            작성 예시
          </Text>
          <View style={styles.row}>
            <Text style={[styles.desc, styles.dot]} accessible={false}>
              {`\u2022`}
            </Text>
            {/* @ts-ignore */}
            <Text style={styles.desc}>
              화장품의 구체적인 성분이 궁금해요.
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.desc, styles.dot]} accessible={false}>
              {`\u2022`}
            </Text>
            {/* @ts-ignore */}
            <Text style={styles.desc}>
              버건디 가디건 혹시 많이 진한 색인가요?
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.desc, styles.dot]} accessible={false}>
              {`\u2022`}
            </Text>
            {/* @ts-ignore */}
            <Text style={styles.desc}>
              가습기의 가로 세로 높이 사이즈가 궁금해요.
            </Text>
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
