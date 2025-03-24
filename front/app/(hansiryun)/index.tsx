import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CheckBox } from '@components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function InterviewScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const colorScheme = useColorScheme();
  
  // 신청하기 버튼 처리
  const handleSubmit = () => {
    if (!phoneNumber) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    
    if (!isChecked) {
      alert('개인 정보 수집과 이용에 동의해주세요.');
      return;
    }
    
    // 여기에 신청 API 호출 로직 추가
    alert('신청이 완료되었습니다.');
    router.back();
  };
  
  // 앞으로 보지 않기 버튼 처리
  const handleDontShowAgain = async () => {
    try {
      await AsyncStorage.setItem('dontShowInterviewPopup', 'true');
      router.back();
    } catch (error) {
      console.error('AsyncStorage 저장 오류:', error);
    }
  };

  // onChangeText 핸들러 수정
  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    
    // 여기서 전화번호 중복 확인 로직 추가
    // 예: 서버에 확인 요청 또는 로컬 데이터와 비교
    // 임시로 예시 번호와 비교
    if (text === '010-1234-5678') {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>픽포미 멤버십을 6개월간 무료로 이용해 보세요</Text>
        {/* <Text style={{ width: "100%", height: 60 }}></Text> */}
        <Text style={styles.description}>
          안녕하세요!{'\n'}{'\n'}픽포미에서 한국시각장애인연합회와 함께 유료 멤버십 서비스를 무료로 사용해보실 수 있는 기회를 제공하게 되었어요. 1분 안에 쉽게 등록하고 픽포미 유료 멤버십을 6개월간 무료로 이용해보세요.{'\n'}{'\n'}
          신청 방법은 다음과 같습니다.{'\n'}
          첫 번째, 아래 전화번호 입력창에 전화번호를 입력해주세요.{'\n'}
          두 번째, 아래 신청하기 버튼을 누르고, 연결되는 구글폼을 작성해주세요.{'\n'}
          이미 넓은마을을 통해 구글폼을 제출하신 분은 다시 작성하지 않으셔도 돼요. 구글폼 제출까지 하셨다면 신청이 완료됩니다.{'\n'}{'\n'}
          한번 신청하시면, 신청일 기준 다음 달 1일부터 6개월 간 멤버십 서비스를 이용하실 수 있어요. 더욱 자세한 내용이 궁금하시다면 넓은마을 픽포미 공지사항을 참고해 주세요!{'\n'}{'\n'}
          항상 픽포미 서비스를 애용해 주셔서 감사드립니다.{'\n'}
        </Text>
        
        <View style={styles.phoneInputContainer}>
          <Text style={styles.inputLabel}>전화번호</Text>
          <TextInput
            style={[styles.input, isDuplicate && styles.inputError]}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="전화번호를 입력해주세요"
            keyboardType="phone-pad"
            maxLength={13}
          />
          {isDuplicate && (
            <View style={styles.errorContainer}>
              <Image 
                source={require('../../assets/images/warning.png')} 
                style={styles.warningIcon} 
              />
              <Text style={styles.errorText}>이미 등록되어 있는 전화번호입니다</Text>
            </View>
          )}
        </View>
        
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkboxWrapper}
            onPress={() => setIsChecked(!isChecked)}
          >
            <CheckBox checked={isChecked} onPress={() => setIsChecked(!isChecked)} />
            <Text style={styles.checkboxLabel}>개인 정보 수집과 이용에 동의합니다.</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>신청하기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.dontShowButton]} 
            onPress={handleDontShowAgain}
          >
            <Text style={styles.dontShowButtonText}>앞으로 보지 않기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 40,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 60,
    marginTop: 60,
    textAlign: 'center',
    color: '#111E4F',
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 30,
    color: '#333',
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 6,
  },
  checkboxContainer: {
    marginBottom: 30,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    borderRadius: 4,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  submitButton: {
    backgroundColor: '#111E4F',
    textAlign: 'center',
    width: 50,
    marginRight: 16, // 여백 추가
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dontShowButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  dontShowButtonText: {
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  warningIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
});
