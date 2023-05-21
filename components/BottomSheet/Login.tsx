import { useRouter } from "expo-router";
import { BottomSheet } from 'react-native-btr';
import { View, Text } from '../Themed';
import Button from '../Button';
import { StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    marginBottom: 33,
  },
  desc: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
  },
  buttonWrap: {
    flexDirection: 'row',
    height: 57,
    width: '100%',
    justifyContent: 'space-between',
    gap: 19,
    marginTop: 33,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 23,
    paddingHorizontal: 27,
  },
  button: {
    flex: 1,
  },
});

const LoginBottomSheet: React.FC<Props> = ({ onClose, visible }) => {
  const router = useRouter();

  const handleClickYes = () => {
    router.push('/(auths)/login');
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
            <Text style={styles.title}>로그인 안내</Text>
            <Text style={styles.desc}>로그인이 필요한 서비스입니다.</Text>
            <View style={styles.buttonWrap}>
              <Button title='네!' onPress={handleClickYes} style={styles.button} />
              <Button color='secondary' title='아니요' onPress={handleClickNo} style={styles.button}/>
            </View>
          </View>
        </BottomSheet>
  );
}
export default LoginBottomSheet;
