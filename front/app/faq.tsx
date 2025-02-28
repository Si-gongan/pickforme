import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, ScrollView } from "react-native";

import { Text, View } from "@components";
import { useColorScheme } from "@hooks";
import Button from "../components/Button";

import type { ColorScheme } from "@hooks";

const FAQS: {
  [key: string]: {
    name: string;
    questions: { question: string; answer: string }[];
  };
} = {
  PICKFORME: {
    // ASIS : AI
    name: `픽포미\n서비스`,
    questions: [
      {
        question: "픽포미는 어떤 쇼핑몰을 기준으로 하나요?",
        answer:
          "픽포미에서는 쿠팡 쇼핑몰에 있는 상품을 더욱 편하게 검색할 수 있어요. 홈 화면의 상품은 쿠팡 쇼핑몰 추천 카테고리를 랜덤으로 노출하고 있습니다. 픽포미에서 원하는 상품을 자유롭게 검색해 보세요!",
      },
      {
        question: "쿠팡 외 다른 쇼핑몰에 있는 상품 정보도 확인할 수 있나요?",
        answer:
          "픽포미는 외부 사이트 상품 설명도 지원하고 있어요. 쿠팡, 무신사, 카카오쇼핑, 11번가의 상품 링크를 픽포미 홈 탭 상단 검색창에 붙여 넣으면, 키워드를 검색했을 때 노출되는 페이지와 동일한 상세 페이지를 확인할 수 있습니다. 지원하는 쇼핑몰은 점차 늘려나갈 예정입니다.",
      },
      {
        question: "픽포미에서 찾은 상품을 구매하고 싶어요.",
        answer:
          "픽포미에서 원하는 상품을 찾았다면 해당 쇼핑몰에서 구매할 수 있어요. 상세 페이지 하단 ‘구매하러 가기’ 버튼을 눌러 보세요. 쇼핑몰 내 해당 상품 링크로 바로 이동합니다. 픽포미에서 구매 대행은 지원하지 않고 있다는 점 참고 부탁드립니다.",
      },
      {
        question: "픽포미 상세페이지에서 궁금한 점이 생겼어요.",
        answer:
          "상품에 대해 궁금한 점이 생겼을 때 픽포미에서 질문해 보세요! 궁금한 상품의 상세 페이지에서 ‘질문하기’ 버튼을 눌러 AI에게 빠르게 질문할 수 있습니다. 또는 상세 페이지 하단 ‘매니저에게 질문하기’를 통해 매니저의 정확한 답변을 받아볼 수 있어요. 9월 3일 전까지 AI에게 횟수 제한 없이 질문할 수 있으며, 매니저에게 한 달 5회까지 질문할 수 있답니다. 9월 3일 후에는 픽포미 플러스 멤버십이 도입됩니다. 자세한 내용은 픽포미 플러스 안내를 참고해주세요.",
      },
      {
        question: "상품 링크를 붙여 넣었는데 설명이 나오지 않아요.",
        answer:
          "현재 픽포미에서 지원하는 사이트의 상품 링크를 붙여넣었는지 다시 한번 확인해주세요! 픽포미가 지원하는 사이트의 상품 링크임에도 설명이 나오지 않는다면, 1:1 문의하기를 이용해주시면 도와드릴게요.",
      },
      {
        question: "픽포미에서 쇼핑하면 쇼핑몰 회원 혜택은 받지 못 하나요?",
        answer:
          "픽포미는 상품 정보를 모두 글로 지원하는 서비스입니다. 상품 구매는 픽포미가 아닌 쇼핑몰에서 이루어지므로, 쇼핑몰 자체적으로 제공하는 혜택을 그대로 이용하실 수 있어요.",
      },
    ],
  },
  AI: {
    // ASIS : PICKFORME
    name: `픽포미\n멤버십`,
    questions: [
      {
        question: "픽포미 멤버십은 무엇인가요?",
        answer:
          "픽포미 멤버십은 한 달 무제한 질문권이에요. 픽포미 멤버십은 9월 14일부터 도입됩니다. 픽포미 멤버십을 구독하시면 한달간 AI에게 무제한으로, 매니저에게는 30회 자유롭게 질문할 수 있어요. 마이페이지 탭에서 ‘이용권 충전하기’ 버튼을 눌러 픽포미 멤버십을 4,900원에 구매할 수 있어요. 픽포미에서 궁금한 상품에 대해 빠르고 정확하게 알아보세요.",
      },
      {
        question: "구매한 픽은 멤버십 도입 후에 사라지나요?",
        answer:
          "14일 이전에 픽을 구매했더라도 걱정하지 마세요! 멤버십 도입 이전에 구매한 픽은 매니저 단일 질문권으로 이용할 수 있어요. 멤버십이 도입된 이후로는 픽을 구매할 수 없어요.",
      },
      {
        question: "기존에 구매한 픽이 멤버십 구독 후 사라졌어요.",
        answer:
          "멤버십을 구독하면, 픽포미 결제 방식이 업데이트되어 픽이 사라져요. 멤버십과 픽을 동시에 사용할 수 없으니, 중복 결제가 되지 않도록 주의를 부탁 드립니다.",
      },
      {
        question: "픽포미 멤버십을 해지하고 싶어요.",
        answer:
          "픽포미 멤버십은 마이페이지 탭 내 ‘나의 멤버십 이용하기’ 페이지에서 해지할 수 있어요. 멤버십을 해지하더라도 결제일로부터 30일까지 그대로 이용 가능합니다.\n픽포미 멤버십을 중도에 취소한다면 매니저 질문을 사용하지 않고 AI 질의를 15회 이하로 사용했을 경우에 한해 환불이 가능합니다.",
      },
    ],
  },
  POINT: {
    // ASIS : POINT
    name: `픽포미\n질문하기`,
    questions: [
      {
        question: "AI 질문하기와 매니저 질문하기는 어떻게 다른가요?",
        answer:
          "AI 질문하기는 픽포미 AI가 상세페이지를 기준으로 궁금한 상품 정보를 제공해줘요. 매니저 질문하기는 궁금한 상품의 상세페이지를 다시 한번 검수하여 정확한 답변을 제공해줍니다. AI 질문하기로 해결하지 못한 궁금증은 매니저 질문하기를 통해 해결해보세요!",
      },
      {
        question: "픽포미 AI에게 질문했는데 원하는 답변을 받지 못했어요.",
        answer:
          "픽포미 AI는 최선의 정보를 제공하기 위해 노력하고 있어요. 픽포미 AI는 질문한 상품 상세 페이지에 정확한 정보가 명시되어 있지 않으면, 완벽한 답변이 어려울 수 있어요. 픽포미 AI를 통해 충분한 정보를 얻지 못하셨다면, 보다 정확한 픽포미 매니저에게 질문할 수 있어요.",
      },
      {
        question: "픽포미 AI가 보낸 답변이 사라졌어요.",
        answer:
          "현재 픽포미 AI 답변은 저장되지 않아요. 상품 페이지를 나가면 픽포미 AI 답변이 사라진다는 점 참고 부탁 드립니다.",
      },
      {
        question: "픽포미 매니저가 보낸 답변을 확인하고 싶어요.",
        answer:
          "매니저 답변은 상품 페이지에서 확인할 수 있어요! 질문한 상품의 상세 페이지에서 ‘질문하기’ 버튼을 눌러 매니저 답변을 확인할 수 있습니다. 또, 위시리스트 탭 ‘매니저에게 문의한 상품’ 버튼에서 언제든 매니저 답변을 확인할 수 있어요.",
      },
      {
        question: "매니저에게 질문했는데 답이 오지 않아요.",
        answer:
          "매니저에게 질문하기 기능은 고객님의 의뢰 내용에 따라 상세페이지를 직접 확인해 상품 정보를 꼼꼼히 검수한 답변을 드리는 서비스입니다. 의뢰를 확인하고 답변을 제공하는 과정에서 최대 1시간 정도 소요됩니다. 픽포미 매니저가 정성스럽게 답변을 작성하는 중이니 조금만 기다려주세요. 더 빠른 서비스를 제공하기 위해 노력하겠습니다.",
      },
    ],
  },
};

export default function HowScreen() {
  const router = useRouter();
  const [tab, setTab] = React.useState<keyof typeof FAQS>("AI");
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
              color={tab === TAB ? "primary" : "tertiary"} // ASIS 'secondary' : 'tertiary'
            />
          ))}
        </View>
        <View style={styles.rows}>
          {FAQS[tab].questions.map(({ question, answer }, i) => (
            <View style={styles.row} key={`FAQ-ROW-${tab}-${i}`}>
              <View style={styles.rowHeader}>
                <View style={styles.questionWrap}>
                  <Text style={styles.question}>{question}</Text>
                  <View style={styles.questionGap} />
                </View>
              </View>
              <View style={styles.answerWrap}>
                <Text style={styles.answer}>{answer}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 34,
    },
    content: {
      paddingHorizontal: 27,
    },
    title: {
      fontWeight: "600",
      fontSize: 22,
      lineHeight: 34,
      marginBottom: 24,
    },
    desc: {
      fontSize: 14,
      lineHeight: 17,
    },
    tabWrap: {
      flexDirection: "row",
      gap: 19,
      flex: 1,
      justifyContent: "flex-start",
      paddingHorizontal: 33,
      marginTop: 26,
      // marginBottom: 33, // ASIS
    },
    rows: {
      flexDirection: "column",
    },
    row: {
      flexDirection: "column",
      paddingVertical: 36,
      paddingHorizontal: 33,
      flex: 1,
    },
    button: {
      width: 70,
      height: 52,
      paddingVertical: 0,
      borderWidth: 1, // TOBE
    },
    buttonText: {
      fontSize: 14,
      lineHeight: 16, // ASIS 14
      textAlign: "center",
    },
    rowHeader: {
      backgroundColor: "transparent",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    questionWrap: {
      backgroundColor: "transparent",
      flex: 1,
    },
    answerWrap: {
      backgroundColor: "transparent",
      marginTop: 8, // ASIS 26
    },
    questionGap: {
      width: 50,
    },
    question: {
      fontSize: 14,
      fontWeight: "600",
    },
    answer: {
      fontSize: 12, // ASIS 14
      lineHeight: 30, // TOBE
      fontWeight: "500", // TOBE
    },
  });
