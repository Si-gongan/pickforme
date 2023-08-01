import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
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
      question: 'question',
      answer: 'answer',
    }, {
      question: '포미가 추천하는 상품은 어떠한 기준으로 선정되나요? ',
      answer: 'asdf',
    }],
  },
  PICKFORME: {
    name: `픽포미\n서비스`,
    questions: [{
      question: 'question',
      answer: 'answer',
    }],
  },
  POINT: {
    name: `포인트\n충전`,
    questions: [{
      question: 'question',
      answer: 'answer',
    }],
  },
  ACCOUNT: {
    name: `회원\n정보`,
    questions: [{
      question: 'question',
      answer: 'answer',
    }],
  },
}

export default function HowScreen() {
  const router = useRouter();
  const [tab,setTab] = React.useState<keyof typeof FAQS>('AI')
  const [selectedQuestion, setSelectedQuestion] = React.useState(0);

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.desc}>
          질문을 터치해 답을 확인해보세요.
        </Text>
      </View>
      <View style={styles.tabWrap}>
        {Object.entries(FAQS).map(([TAB, { name }]) => (
          <Button
            key={`FAQ-TAB-${TAB}`}
            title={name}
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => {
              setSelectedQuestion(0);
              setTab(TAB);
            }}
            color='secondary'
          />
        ))}
      </View>
      <View style={styles.rows}>
        {FAQS[tab].questions.map(({ question, answer }, i) => (
          <Pressable onPress={() => setSelectedQuestion(i)}>
          <View style={[styles.row, selectedQuestion === i && styles.selectedRow]} key={`FAQ-ROW-${tab}-${i}`}>
            <View style={styles.rowHeader}>
              <View style={styles.questionWrap}>
                <Text style={styles.question}>
                  {question}
                </Text>
                <View style={styles.questionGap} />
              </View>
              <View style={styles.moreButton} />
            </View>
            {selectedQuestion === i && (
              <View style={styles.answerWrap}>
                <Text style={styles.answer}>
                  {answer}
                </Text>
              </View>
            )}
          </View>
          </Pressable>
        ))}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
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
  selectedRow: {
    backgroundColor: 'tertiary'
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionWrap: {
    flex: 1,
  },
  answerWrap: {
    marginTop: 26,
  },
  questionGap: {
    width: 50,
  },
  question: {

    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    flexShirnk: 0,
    width: 20,
    height: 20,
    marginLeft: 50,
    marginRight: 20,
    borderRadius: 20,
    backgroundColor: 'red',
  },
  answer: {
    fontSize: 14,
  },
});
