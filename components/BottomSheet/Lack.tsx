import { useRouter } from "expo-router";
import { BottomSheet } from 'react-native-btr';
import { View, Text } from '../Themed';
import Button from '../Button';
import { StyleSheet } from 'react-native';
import { Props, styles } from './Base';

const localStyles = StyleSheet.create({
  title: {
    marginBottom: 33,
  },
});

const LoginBottomSheet: React.FC<Props> = ({ onClose, visible }) => {
  const router = useRouter();

  const handleClickYes = () => {
    router.push('/point');
    onClose();
  }
  const handleClickNo = () => {
    onClose();
  }
  return (
    <BottomSheet
      visible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>앗 !이용권이 부족해요</Text>
        <Text style={[styles.title, localStyles.title]}>픽을 충전하시겠어요? </Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <Button title='네!' onPress={handleClickYes} style={styles.button} />
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
