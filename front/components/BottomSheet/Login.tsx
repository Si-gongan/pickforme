import { useRouter } from "expo-router";
import { BottomSheet } from 'react-native-btr';
import { useAtom } from 'jotai';
import { isShowLoginModalAtom } from '../../stores/auth/atoms';
import { View, Text } from '../Themed';
import Button from '../Button';
import { StyleSheet } from 'react-native';
import { Props, styles } from './Base';
import Login from '../../app/(auths)/login';

const localStyles = StyleSheet.create({
  title: {
    marginBottom: 33,
  },
  desc: {
    marginBottom: 20,
  },
  bottomSheet: {
    flex: 0,
  },
});

const LoginBottomSheet: React.FC<Props> = () => {
  const router = useRouter();

  const [visible, setVisible] = useAtom(isShowLoginModalAtom);

  const onClose = () => setVisible(false);
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
      <Login style={[styles.bottomSheet, localStyles.bottomSheet]} />
      {/*
        <Text style={[styles.title, localStyles.title]}>로그인 안내</Text>
        <Text style={[styles.desc, localStyles.desc]}>로그인이 필요한 서비스입니다.</Text>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <Button title='네!' onPress={handleClickYes} style={styles.button} />
          </View>
          <View style={styles.buttonWrap}>
            <Button color='tertiary' title='아니요' onPress={handleClickNo} style={styles.button}/>
          </View>
        </View>
      */}
    </BottomSheet>
  );
}
export default LoginBottomSheet;
