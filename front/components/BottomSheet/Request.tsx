import { useRef,useState } from 'react';
import { Platform, KeyboardAvoidingView, TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import BottomSheet from 'react-native-modal';

import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import * as Clipboard from 'expo-clipboard';

import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import { previewAtom, getPreviewAtom, requestBottomSheetAtom, addRequestAtom } from '../../stores/request/atoms';
import { isShowLackModalAtom } from '../../stores/auth/atoms';

import { ResearchRequestParams } from '../../stores/request/types';
import Colors from '../../constants/Colors';
import { pushBottomSheetAtom } from '../../stores/layout/atoms';
import { Props, styles } from './Base';
import useCheckPoint from '../../hooks/useCheckPoint';

import Button from '../Button';
import { Text, View } from '../Themed';

export default function ResearchBottomSheet() {
    const headerTitleRef = useRef(null);

  const isShowLackModalVisible = useAtomValue(isShowLackModalAtom);

  const addRequest = useSetAtom(addRequestAtom);
  const preview = useAtomValue(previewAtom);
  const colorScheme = useColorScheme();
  const localStyles = useLocalStyles(colorScheme);
  const pushBottomSheet = useSetAtom(pushBottomSheetAtom);
  const [isShareChecked, setIsShareChecked] = useState(false);

  const [data, setData] = useState<Omit<ResearchRequestParams, 'product'>>({
    type: 'RESEARCH',
    link: '',
    text: '',
  });
  const checkPoint = useCheckPoint(1, (params: ResearchRequestParams) => {
    if (product) {
      addRequest(params);
    }
  });
  const handleSubmit = () => {
    const params = { ...data, product };
    onClose();
    checkPoint(params);
  }
  const disabled = !data.text;
  const [product,setProduct] = useAtom(requestBottomSheetAtom);
  const onClose = () => {
    setData({ ...data, text: '' });
    setProduct(undefined);
  }
  if (isShowLackModalVisible) {
    return;
  }
  return (
    <BottomSheet
      style={styles.base}
      isVisible={!!product}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
       <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
        style={[styles.bottomSheet, localStyles.root]}>
          <Text style={[styles.title, localStyles.title]} ref={headerTitleRef}>
            상품에 대해 궁금한 점을 자유롭게 적어주세요.
          </Text>
          <View style={localStyles.textAreaContainer} >
            <TextInput
              accessibilityRole='none'
              accessibilityHint='텍스트 입력창'
              style={[localStyles.textArea, localStyles.textAreaBig]}
              underlineColorAndroid="transparent"
              numberOfLines={4}
              textAlignVertical='top'
              multiline
              onChangeText={(text) => setData({ ...data, text })}
            />
          </View>
          <Button style={styles.button} title='1픽으로 매니저에게 물어보기' onPress={handleSubmit} disabled={disabled} />
        </View>
        </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const useLocalStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  root: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '400',
    marginBottom: 20,
    color: '#1e1e1e',
  },
  textAreaContainer: {
    width: '100%',
    borderColor: Colors[colorScheme].borderColor.primary,
    borderWidth: 1,
    padding: 5,
    marginBottom: 24,
  },
  textArea: {
    color: Colors[colorScheme].text.primary,
  },
  textAreaBig: {
    height: 116,
  },
  buttonText: {
    color: Colors[colorScheme].text.primary,
  },
});
