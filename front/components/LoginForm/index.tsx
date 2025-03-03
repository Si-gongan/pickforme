import { View, Text, TouchableOpacity } from "react-native";

export default function LoginForm() {
  return (
    <View>
      <Text>로그인하면 픽포미의 모든{"\n"}서비스를 이용할 수 있어요!</Text>
      <View>
        <TouchableOpacity>
          <Text>카카오로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text>Apple로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text>구글로 로그인</Text>
        </TouchableOpacity>
      </View>

      <Text>
        픽포미에 첫 회원가입하고{"\n"}AI 질문 이용권을 무료로 받아가세요!
      </Text>
    </View>
  );
}
