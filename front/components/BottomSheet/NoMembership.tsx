import { useRef, useEffect } from 'react';
import { findNodeHandle, AccessibilityInfo } from 'react-native';
import { useRouter } from "expo-router";
import BottomSheet from 'react-native-modal';
import { useAtom } from 'jotai';
import { isShowNoMembershipModalAtom } from '../../stores/auth/atoms';
import { View, Text } from '../Themed';
import Button from '../Button';
import { Props, styles } from './Base';

const NoMembershipBottomSheet: React.FC<Props> = () => {
  const router = useRouter();
  const headerTitleRef = useRef(null);

  const [visible, setVisible] = useAtom(isShowNoMembershipModalAtom);

  const onClose = () => setVisible(false);

  const handleClickYes = () => {
    router.push('/membership');
    onClose();
  }
  const handleClickNo = () => {
    onClose();
  }

  useEffect(() => {
    const focusOnHeader = () => {
      const node = findNodeHandle(headerTitleRef.current);
      if (visible && node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
    setTimeout(focusOnHeader, 500);
  }, [visible]);

  return (
    <BottomSheet
      style={styles.base}
      isVisible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.bottomSheet}>
        <Text style={styles.title} ref={headerTitleRef}>픽포미플러스 멤버십 기능이에요.</Text>
        <Text style={styles.desc}>
          {'픽포미플러스 멤버십을 구독하면,\n질문하기 기능을 무제한으로 사용할 수 있어요.\n지금 멤버십을 시작하시겠어요?'}
        </Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <Button color='secondary' title='지금 시작하기' onPress={handleClickYes} style={styles.button} />
          </View>
          <View style={styles.buttonWrap}>
            <Button color='tertiary' title='나중에 할래요' onPress={handleClickNo} style={styles.button}/>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
export default NoMembershipBottomSheet;
