import { useRouter, Link } from "expo-router";
import BottomSheet from 'react-native-modal';
import { useAtom } from 'jotai';
import { isShowOnboardingModalAtom } from '../../stores/auth/atoms';
import { View, Text } from '../Themed';
import Button from '../Button';
import { StyleSheet } from 'react-native';
import { Props, styles } from './Base';

import localStyles from  '../../app/how/styles';

const LackBottomSheet: React.FC<Props> = () => {
  const router = useRouter();

  const [visible, setVisible] = useAtom(isShowOnboardingModalAtom);

  const onClose = () => setVisible(false);

  return (
    <BottomSheet
      style={styles.base}
      isVisible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.bottomSheet}>
        <View style={localStyles.section}>
          <Text style={localStyles.title}>픽포미, 이렇게 사용해 보세요!</Text>
        </View>
        <View style={localStyles.section}>
          <Text style={localStyles.subtitle}>
            1. 상품 검색하기
          </Text>
          <Text style={localStyles.desc}>
앱 최상단 검색창을 눌러 원하는 상품을 검색하거나 궁금한 상품의 링크를 붙여넣어보세요. 상품 링크를 붙여 넣을 경우, 픽포미가 해당 상세페이지의 내용을 불러와 자동으로 상품의 이미지 설명, 상세페이지 설명과 리뷰를 요약해 줄거예요. 현재 쿠팡, 11번가, 네이버 쇼핑 상품 링크를 검색할 수 있어요.
          </Text>
        </View>
        <View style={localStyles.section}>
          <Text style={localStyles.subtitle}>
            2. 상세페이지 설명 받기
          </Text>
          <Text style={localStyles.desc}>
상품의 상세페이지로 들어가 이미지 설명, 자세한 설명, 리뷰 요약 버튼을 눌러보세요. AI가 사진에 대한 꼼꼼한 설명과 상세페이지 속 글자를 인식해 상품을 자세히 설명해 주고, 등록된 리뷰를 요약해 줄거예요.
          </Text>
        </View>
        <View style={localStyles.section}>
          <Text style={localStyles.subtitle}>
            3. 매니저 질문하기
          </Text>
          <Text style={localStyles.desc}>
            상품의 상세페이지에서 궁금한 질문이 생기면 매니저 질문하기 버튼을 눌러 상품에 대해 궁금한 점을 물어보세요. 픽포미 매니저가 한시간에서 두시간 이내로 답변해 줄거예요. 답변은 위시리스트 탭에서 매니저에게 문의한 상품에서 확인할 수 있어요
.
          </Text>
        </View>
        <View style={localStyles.section}>
          <Text style={localStyles.desc}>
            그럼 이제 픽포미 즐기러 가볼까요?
          </Text>
        </View>
        <View style={localStyles.section}>
          <Link href='/(tabs)' accessibilityRole='button' onPress={() => onClose()}>
          <Text style={[localStyles.desc, localStyles.link]}>
            홈으로 이동하기
          </Text>
          </Link>
        </View>

      </View>
    </BottomSheet>
  );
}
export default LackBottomSheet;
