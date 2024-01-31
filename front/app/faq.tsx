import { useRouter } from "expo-router";
import React from "react";
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';

const FAQS: {
  [key: string]: {
    name: string,
    questions: { question: string, answer: string }[],
  },
} = {
  AI: {
    name: `AI\n포미`,
    questions: [{
      question: 'AI 포미는 무엇을 할 수 있나요?',
      answer: 'AI 포미는 고객님께서 물어보신 제품을 쿠팡에서 찾아 추천해 드려요. 빠르고 편리하게 필요한 물건을 찾고 싶으시다면, 픽포미의 AI ‘포미’와 대화해 보세요.',
    }, {
      question: '포미가 추천하는 상품은 어떠한 기준으로 선정되나요? ',
      answer: '포미는 쿠팡을 기반으로 제품을 추천해 드려요. 고객님께서 조건을 추가하지 않으신다면, 제품의 가격, 구매 수, 리뷰 수, 평점 등을 기준으로 제품을 추천해 드립니다.',
    }, {
      question: '포미가 원하는 정보를 주지 않아요.',
      answer: 'AI 포미는 최선의 정보를 제공하기 위해 노력하고 있어요. 그럼에도 아직 포미는 똑똑해지는 중이어서, 완벽한 정보를 제공하지 못할 수도 있습니다. 포미를 통해 충분한 정보를 얻지 못하셨다면, 매니저가 직접 제공하는 픽포미 추천이나 픽포미 설명 서비스를 이용해보시는 걸 추천드려요.',
    }],
  },
  PICKFORME: {
    name: `픽포미\n서비스`,
    questions: [{
      question: '매니저에게 의뢰했는데 답이 오지 않아요.',
      answer: '픽포미 추천과 픽포미 분석은 매니저가 고객님의 요청에 따라 하나하나 꼼꼼하게 맞춤형 정보를 작성해서 제공하는 서비스입니다. 의뢰를 확인하고, 답변을 제공하는 과정에서 최대 1~2시간이 소요됩니다. 매니저가 정성스럽게 답변을 작성하는 중이니 조금만 더 기다려 주세요. 더 빠른 서비스를 제공하기 위해 노력하겠습니다.',
    }, {
      question: '예전에 물어본 채팅 창이 닫혔어요.',
      answer: '원활한 운영을 위해 결과 리포트 전송 후 24시간 이내에 추가적인 메시지가 오지 않는다면, 자동으로 채팅을 종료하고 있습니다. 이전에 주고받은 내용은 그대로 읽을 수 있으나, 새로운 질문은 홈 화면에서 원하시는 서비스를 선택해 새롭게 의뢰해 주세요.',
    }, {
      question: '‘픽포미 구매’는 언제부터 사용이 가능한가요?',
      answer: `픽포미 구매는 아직 준비 중인 서비스이에요. 해당 페이지에서 ‘서비스가 필요해요' 버튼을 눌러주시면, 서비스 출시 이후 빠르게 이용하실 수 있게끔 가장 먼저 연락을 드릴게요.`,
    }, {
      question: '쿠팡이나 11번가와 같은 대형 쇼핑몰 뿐만 아니라, 작은 쇼핑몰에 올라온 정보도 물어볼 수 있나요?',
      answer: '네, 픽포미 매니저는 대형 쇼핑 플랫폼뿐만 아니라 작은 입점 업체부터 다양한 중고 거래 물건까지 모두 해설해 드릴 수 있어요. 궁금한 정보는 무엇이든 편하게 물어봐 주세요.',
    }],
  },
  POINT: {
    name: `픽\n충전`,
    questions: [{
      question: '픽이 무엇인가요?',
      answer: '‘픽’은 픽포미 앱에서 의뢰를 할 때 쓰이는 이용권이에요. 픽은 최초 가입 시 무료체험으로 일부 제공되며, 그 이후에는 멤버십 결제를 통해 얻을 수 있어요.',
    }, {
      question: '픽은 어떻게 충전할 수 있나요?',
      answer: '마이페이지의 ‘픽 충전’ 페이지에서 원하는 단위를 선택해 픽을 충전하실 수 있어요. 현재 픽포미는 다양한 서비스를 무료로 이용해보실 수 있게 회원가입 시 3픽을 제공해 드리고 있습니다. 3픽으로 매니저가 제공하는 픽포미 추천, 픽포미 설명의 유료 서비스를 무료로 이용해 보세요!',
    }],
  },
}

export default function HowScreen() {
  const router = useRouter();
  const [tab,setTab] = React.useState<keyof typeof FAQS>('AI')
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <Text style={styles.title}>자주 묻는 질문</Text>
      </View>
      <View style={styles.tabWrap}>
        {Object.entries(FAQS).map(([TAB, { name }]) => (
          <Button
            key={`FAQ-TAB-${TAB}`}
            title={name}
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => {
              setTab(TAB);
            }}
            color={tab === TAB ? 'secondary' : 'tertiary'}
          />
        ))}
      </View>
      <View style={styles.rows}>
        {FAQS[tab].questions.map(({ question, answer }, i) => (
          <View style={styles.row} key={`FAQ-ROW-${tab}-${i}`}>
            <View style={styles.rowHeader}>
              <View style={styles.questionWrap}>
                <Text style={styles.question}>
                  {question}
                </Text>
                <View style={styles.questionGap} />
              </View>
            </View>
            <View style={styles.answerWrap}>
              <Text style={styles.answer}>
                {answer}
              </Text>
            </View>
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 34,
  },
  content: {
    paddingHorizontal: 27,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 34,
    marginBottom: 24, 
  },
  desc: {
    fontSize: 14,
    lineHeight: 17,
  },
  tabWrap: {
    flexDirection: 'row',
    gap: 19,
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 33,
    marginTop: 26,
    marginBottom: 33,
  },
  rows: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'column',
    paddingVertical: 36,
    paddingHorizontal: 33,
    flex: 1,
  },
  button: {
    width: 70,
    height: 52,
    paddingVertical: 0,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 14,
    textAlign: 'center',
  },
  rowHeader: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionWrap: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  answerWrap: {
    backgroundColor: 'transparent',
    marginTop: 26,
  },
  questionGap: {
    width: 50,
  },
  question: {
    fontSize: 14,
    fontWeight: '600',
  },
  answer: {
    fontSize: 14,
  },
});
