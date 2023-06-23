import { useRouter } from "expo-router";
import { BottomSheet } from 'react-native-btr';
import { useAtom } from 'jotai';
import { isShowGreetingModalAtom } from '../../stores/auth/atoms';
import { View, Text } from '../Themed';
import Button from '../Button';
import { StyleSheet } from 'react-native';
import { Props, styles } from './Base';

const localStyles = StyleSheet.create({
  title: {
    lineHeight: 29,
  },
});

const LoginBottomSheet: React.FC<Props> = () => {
  const router = useRouter();

  const [visible, setVisible] = useAtom(isShowGreetingModalAtom);

  const onClose = () => setVisible(false);

  const handleClickYes = () => {
    onClose();
  }
  return (
    <BottomSheet
      visible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.bottomSheet}>
        <Text style={[styles.title, localStyles.title]}>
          회원가입 보상
        </Text>
        <Text style={[styles.desc, localStyles.title]}>
          감사의 의미로 3회 무료 이용권(3픽)을 드렸어요.
          지금 바로 픽포미 서비스를 이용해보세요!
        </Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <Button color='secondary' title='확인' onPress={handleClickYes} style={styles.button} />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
export default LoginBottomSheet;
