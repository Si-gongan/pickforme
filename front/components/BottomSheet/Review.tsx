import { useRouter } from "expo-router";
import { useState} from 'react'
import BottomSheet from 'react-native-modal';
import { useAtom, useSetAtom } from 'jotai';
import { reviewRequestAtom, reviewBottomSheetAtom } from '../../stores/request/atoms';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';

import { View, Text } from '../Themed';
import Button from '../Button';
import {  AccessibilityInfo, StyleSheet, Image, TextInput, Pressable } from 'react-native';
import { Props, styles } from './Base';
import Colors from '../../constants/Colors';


const useLocalStyles = (colorScheme: ColorScheme) => StyleSheet.create({

  starWrap: {
    marginBottom: 26,
    flexDirection: 'row',
    gap: 10,
  },
  star: {
    width: 42,
    height: 42,
  },
  textAreaContainer: {
    width: '100%',
    borderColor: Colors[colorScheme].borderColor.primary,
    borderWidth: 1,
    padding: 5,
    marginTop: 9,
    marginBottom: 33,
  },
  textArea: {
    color: Colors[colorScheme].text.primary,
    fontSize: 18,
  },
  row: {
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
  },
  desc: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },
  root: {
    alignItems: 'center',
  },
});

const LoginBottomSheet: React.FC<Props> = () => {
  const router = useRouter();
    const colorScheme = useColorScheme();
  const localStyles = useLocalStyles(colorScheme);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [requestId, setRequestId] = useAtom(reviewBottomSheetAtom);
  const setReview = useSetAtom(reviewRequestAtom);

  const onClose = () => {
    setRequestId(undefined);
    setText('');
    setRating(5);
  }
  const handleClickYes = () => {
    if (requestId) {
      setReview({ rating, text, _id: requestId });
    }
    onClose();
  }
  const handlePress = (idx: number) => {
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(
        `별 ${idx}개 선택`
      );
    }, 100);
    setRating(idx);
  }
  return (
    <BottomSheet
      style={styles.base}
      isVisible={!!requestId}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={[styles.bottomSheet, localStyles.root]}>
        <Text style={[styles.title, localStyles.title]}>
          결과 리포트에 대한 후기를 남겨주세요!
        </Text>
        <View style={localStyles.starWrap}>
          {[1,2,3,4,5].map((idx) => (
            <Pressable onPress={() => handlePress(idx)} key={`Review-star-${idx}`} accessibilityRole='button' accessibilityLabel={`별 ${idx}개`}>
              <Image style={localStyles.star} source={idx <= rating ? require('../../assets/images/StarFill.png') :  require('../../assets/images/Star.png')} />
            </Pressable>
          ))}
        </View>
        <View style={localStyles.row}>
        <Text style={localStyles.desc}>
          매니저에게 남기고 싶은 말을 적어주세요! (선택사항)
        </Text>
        </View>
        <View style={localStyles.textAreaContainer}>
          <TextInput
            style={localStyles.textArea}
            underlineColorAndroid="transparent"
            onChangeText={setText}
            accessibilityLabel="매니저에게 남기고 싶은 말"
            value={text}
          />
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonWrap}>
            <Button color='secondary' title='후기 남기기' onPress={handleClickYes} style={styles.button} />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
export default LoginBottomSheet;
