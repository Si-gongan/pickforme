import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CheckBox } from '@components';
import { PhoneCheckAPI, PhoneSubmitAPI, SetPopupAPI } from '../../stores/auth/apis';
import { userAtom } from '@stores';
import { useAtomValue } from 'jotai';
import { setClientToken } from '../../utils/axios';
import Colors from '../../constants/Colors';
import useColorScheme from '../../hooks/useColorScheme';

export default function InterviewScreen() {
    const router = useRouter();
    const user = useAtomValue(userAtom);
    const colorScheme = useColorScheme();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    // 전화번호 형식 검사 (010으로 시작하는 11자리)
    const phoneRegex = /^010\d{8}$/;

    useEffect(() => {
        if (!user.token) {
            router.replace('/(onboarding)');
        }

        setClientToken(user.token);

        if (user?._id) {
            const payload = { id: user._id, flag: '0' };
            console.log(payload);

            SetPopupAPI(payload)
                .then(res => {
                    console.log(res?.data);
                    // phone 값 활용 가능
                })
                .catch(error => {
                    console.error('팝업 설정 실패:', error);
                });
        }
    }, [user]);

    // 신청하기 버튼 처리
    const handleSubmit = async () => {
        // fot test
        // router.replace('/(tabs)');
        // return;

        if (!phoneNumber) {
            alert('전화번호를 입력해주세요.');
            return;
        }

        if (!isChecked) {
            alert('개인 정보 수집과 이용에 동의해주세요.');
            return;
        }

        const id = user?._id;
        const token = user?.token;

        if (!id || !token) {
            console.log('id 또는 token이 없습니다.');
            return;
        }

        if (!phoneRegex.test(phoneNumber)) {
            alert('유효하지 않은 전화번호 형식입니다.');
            return;
        }

        try {
            const response = await PhoneSubmitAPI({
                id: id,
                phone: phoneNumber
            });
            console.log('response :', response?.data);

            alert('신청이 완료되었습니다.');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('API 에러:', error);
        }
    };

    // 앞으로 보지 않기 버튼 처리
    const handleDontShowAgain = async () => {
        router.replace('/(tabs)');

        if (!user?._id) {
            console.log('id가 없습니다.');
            return;
        }

        const response = await SetPopupAPI({ id: user?._id, flag: '1' });
        console.log('response :', response?.data);
    };

    // onChangeText 핸들러 수정
    const handlePhoneChange = async (text: string) => {
        setPhoneNumber(text);
        // 숫자만 추출
        let phoneNumber = text.replace(/[^0-9]/g, '');

        if (!phoneRegex.test(phoneNumber)) {
            console.log('유효하지 않은 전화번호 형식입니다.');
            return;
        }

        const id = user?._id;
        const token = user?.token;

        if (!id || !token) {
            console.log('id 또는 token이 없습니다.');
            return;
        }

        // 토큰 설정
        setClientToken(token);

        setPhoneNumber(text);

        try {
            const response = await PhoneCheckAPI({
                id: id,
                phone: phoneNumber
            });
            console.log('response :', response?.data);
        } catch (error: any) {
            console.error('API 에러:', error);

            if (error.response?.status === 409) {
                setIsDuplicate(true);
            } else {
                setIsDuplicate(false);
            }
        }
    };

    return (
        <ScrollView
            style={[
                styles.container,
                {
                    backgroundColor:
                        colorScheme === 'dark' ? Colors.dark.background.primary : Colors.light.background.primary
                }
            ]}
        >
            <StatusBar style="auto" />
            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        { color: colorScheme === 'dark' ? Colors.dark.text.primary : Colors.light.text.primary }
                    ]}
                >
                    픽포미 멤버십을 6개월간 무료로 이용해 보세요
                </Text>
                {/* <Text style={{ width: "100%", height: 60 }}></Text> */}
                <Text
                    style={[
                        styles.description,
                        { color: colorScheme === 'dark' ? Colors.dark.text.primary : Colors.light.text.primary }
                    ]}
                >
                    안녕하세요!{'\n'}
                    {'\n'}픽포미에서 한국시각장애인연합회와 함께 유료 멤버십 서비스를 무료로 사용해보실 수 있는 기회를
                    제공하게 되었어요. 1분 안에 쉽게 등록하고 픽포미 유료 멤버십을 6개월간 무료로 이용해보세요.{'\n'}
                    {'\n'}
                    신청 방법은 다음과 같습니다.{'\n'}첫 번째, 아래 전화번호 입력창에 전화번호를 입력해주세요.{'\n'}두
                    번째, 아래 신청하기 버튼을 누르고, 연결되는 구글폼을 작성해주세요.{'\n'}
                    이미 넓은마을을 통해 구글폼을 제출하신 분은 다시 작성하지 않으셔도 돼요. 구글폼 제출까지 하셨다면
                    신청이 완료됩니다.{'\n'}
                    {'\n'}
                    한번 신청하시면, 신청일 기준 다음 달 1일부터 6개월 간 멤버십 서비스를 이용하실 수 있어요. 더욱
                    자세한 내용이 궁금하시다면 넓은마을 픽포미 공지사항을 참고해 주세요!{'\n'}
                    {'\n'}
                    항상 픽포미 서비스를 애용해 주셔서 감사드립니다.{'\n'}
                </Text>

                <View style={styles.phoneInputContainer}>
                    <Text
                        style={[
                            styles.inputLabel,
                            { color: colorScheme === 'dark' ? Colors.dark.text.primary : Colors.light.text.primary }
                        ]}
                    >
                        전화번호
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            isDuplicate && styles.inputError,
                            {
                                borderColor:
                                    colorScheme === 'dark'
                                        ? Colors.dark.borderColor.primary
                                        : Colors.light.borderColor.primary,
                                color: colorScheme === 'dark' ? Colors.dark.text.primary : Colors.light.text.primary,
                                backgroundColor:
                                    colorScheme === 'dark'
                                        ? Colors.dark.background.primary
                                        : Colors.light.background.primary
                            }
                        ]}
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        placeholder="전화번호를 입력해주세요"
                        keyboardType="phone-pad"
                        maxLength={13}
                        placeholderTextColor={
                            colorScheme === 'dark' ? Colors.dark.text.secondary : Colors.light.text.secondary
                        }
                    />
                    {isDuplicate && (
                        <View style={styles.errorContainer}>
                            <Image
                                source={require('../../assets/images/warning.png')}
                                style={[
                                    styles.warningIcon,
                                    { tintColor: colorScheme === 'dark' ? '#FF6B6B' : undefined }
                                ]}
                            />
                            <Text style={styles.errorText}>이미 등록되어 있는 전화번호입니다</Text>
                        </View>
                    )}
                </View>

                <View style={styles.checkboxContainer}>
                    <TouchableOpacity style={styles.checkboxWrapper} onPress={() => setIsChecked(!isChecked)}>
                        <CheckBox checked={isChecked} onPress={() => setIsChecked(!isChecked)} />
                        <Text
                            style={[
                                styles.checkboxLabel,
                                {
                                    color: colorScheme === 'dark' ? Colors.dark.text.primary : Colors.light.text.primary
                                }
                            ]}
                        >
                            개인 정보 수집과 이용에 동의합니다.
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.submitButton,
                            {
                                backgroundColor:
                                    colorScheme === 'dark'
                                        ? Colors.dark.button.primary.background
                                        : Colors.light.button.primary.background
                            }
                        ]}
                        onPress={handleSubmit}
                    >
                        <Text
                            style={[
                                styles.submitButtonText,
                                {
                                    color:
                                        colorScheme === 'dark'
                                            ? Colors.dark.text.secondary
                                            : Colors.light.text.secondary
                                }
                            ]}
                        >
                            신청하기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.dontShowButton,
                            {
                                borderColor:
                                    colorScheme === 'dark'
                                        ? Colors.dark.borderColor.primary
                                        : Colors.light.borderColor.primary
                            }
                        ]}
                        onPress={handleDontShowAgain}
                    >
                        <Text
                            style={[
                                styles.dontShowButtonText,
                                {
                                    color: colorScheme === 'dark' ? Colors.dark.text.primary : Colors.light.text.primary
                                }
                            ]}
                        >
                            앞으로 보지 않기
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 40,
        paddingTop: 80
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 40,
        marginTop: 20,
        textAlign: 'center'
    },
    description: {
        fontSize: 14,
        lineHeight: 24,
        marginBottom: 30
    },
    phoneInputContainer: {
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16
    },
    inputError: {
        borderColor: '#FF3B30'
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 6
    },
    checkboxContainer: {
        marginBottom: 30
    },
    checkboxWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 14
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30
    },
    button: {
        flex: 1,
        borderRadius: 4,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50
    },
    submitButton: {
        textAlign: 'center',
        width: 50,
        marginRight: 16
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600'
    },
    dontShowButton: {
        backgroundColor: 'transparent',
        borderWidth: 1
    },
    dontShowButtonText: {
        fontSize: 14
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6
    },
    warningIcon: {
        width: 16,
        height: 16,
        marginRight: 6
    }
});
