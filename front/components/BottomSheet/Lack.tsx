import { useRouter } from "expo-router";
import BottomSheet from 'react-native-modal';
import { useAtom } from 'jotai';
import { isShowLackModalAtom } from '../../stores/auth/atoms';
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

  const [visible, setVisible] = useAtom(isShowLackModalAtom);

  const onClose = () => setVisible(false);

  const handleClickYes = () => {
    router.push('/point');
    onClose();
  }
  const handleClickNo = () => {
    onClose();
  }
  return (
    <BottomSheet
      style={styles.base}
      isVisible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.bottomSheet}>
        <Text style={[styles.title, localStyles.title]}>{`앗! 이용권이 부족해요 😲\n픽을 충전하시겠어요?`}</Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <Button color='secondary' title='네' onPress={handleClickYes} style={styles.button} />
          </View>
          <View style={styles.buttonWrap}>
            <Button color='tertiary' title='아니요' onPress={handleClickNo} style={styles.button}/>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
export default LoginBottomSheet;
