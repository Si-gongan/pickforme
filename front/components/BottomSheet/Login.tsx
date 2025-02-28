import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BottomSheet from "react-native-modal";
import { useAtom } from "jotai";

import { isShowLoginModalAtom } from "@stores";
import { Props, styles } from "./Base";
import Login from "../../app/(auths)/login";

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

  return (
    <BottomSheet
      style={styles.base}
      isVisible={visible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <Login style={[styles.bottomSheet, localStyles.bottomSheet]} />
    </BottomSheet>
  );
};
export default LoginBottomSheet;
