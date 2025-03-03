import { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";

import { InfoForm, Footer, Button } from "@components";

export default function OnBoardingInfoScreen() {
  const style = useStyle();

  const onSubmit = useCallback(function () {}, []);

  return (
    <View style={style.OnBoardingInfoContainer}>
      <View style={style.OnBoardingInfoContent}>
        <InfoForm />
      </View>
      <Footer>
        <Button title="확인" onPress={onSubmit} />
      </Footer>
    </View>
  );
}

function useStyle() {
  return StyleSheet.create({
    OnBoardingInfoContainer: {
      flex: 1,
      backgroundColor: "#fff",
    },
    OnBoardingInfoContent: {
      flex: 1,
    },
  });
}
