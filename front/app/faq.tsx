import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';

const FAQS: {
  [key: string]: {
    name: string,
    questions: { question: string, answer: string }[],
  },
} = {
  A: {
    name: 'A',
    questions: [{
      question: '',
      answer: '',
    }],
  },
}

export default function HowScreen() {
  const router = useRouter();
  const [tab,setTab] = React.useState<keyof typeof FAQS>('A')

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
          <Button key={`FAQ-TAB-${TAB}`} title={name} onPress={() => setTab(TAB)}/>
        ))}
      </View>
      <View style={styles.rows}>
        {FAQS[tab].questions.map(({ question, answer }, i) => (
          <View style={styles.row} key={`FAQ-ROW-${tab}-${i}`}>
            <View style={styles.questionWrap}>
              <Text style={styles.question}>
                {question}
              </Text>
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
  },
  rows: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'column',
  },
  questionWrap: {
  },
  answerWrap: {
  },
  question: {
  },
  answer: {
  },
});
