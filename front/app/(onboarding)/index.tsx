import { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import { settingAtom } from "@stores";
import type { ISetting } from "@types";

import { InfoForm, Footer, Button } from "@components";

export default function OnBoardingInfoScreen() {
    const style = useStyle();

    const router = useRouter();
    const [, onSetting] = useAtom(settingAtom);
    const [payload, setPayload] = useState<ISetting>({
        name: "",
        vision: undefined,
        isReady: false,
    });

    const onSubmit = useCallback(() => {
        // 필수 입력값 검증
        if (!payload.name || !payload.vision) {
            return;
        }

        // 설정 저장
        onSetting({
            ...payload,
            isReady: true, // 온보딩 완료 상태로 설정
        });
        console.log("(onboarding)제출된 정보:", payload);

        // tabs 스크린으로 이동
        router.replace("/(tabs)");
    }, [payload, onSetting, router]);

    return (
        <View style={style.OnBoardingInfoContainer}>
            <View style={style.OnBoardingInfoContent}>
                <InfoForm value={payload} onChange={setPayload} />
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
