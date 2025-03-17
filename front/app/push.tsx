import { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";

import { userAtom } from "@stores";
import { useServicePush } from "@services";
import { BackHeader, Footer, Button, PushForm } from "@components";

import type { IPush } from "@types";

export default function PushScreen() {
    const style = useStyle();
    const router = useRouter();
    const [user, onUser] = useAtom(userAtom);

    const [payload, onPayload] = useState<IPush>(user?.push || {});

    const { mutateAsync } = useServicePush({
        onSuccess: function (data) {
            onUser(function (prev) {
                return { ...prev, push: data as IPush };
            });
            if (router.canGoBack()) {
                router.back();
            }
        },
    });

    useEffect(
        function () {
            onPayload(function (prev) {
                return { ...prev, service: user?.push?.service };
            });
        },
        [user?.push?.service]
    );

    const onSubmit = useCallback(
        function () {
            console.log("(push)제출된 정보:", payload);
            mutateAsync(payload);
        },
        [payload, mutateAsync]
    );

    return (
        <View style={style.PushContainer}>
            <BackHeader />
            <View style={style.PushContent}>
                <PushForm value={payload} onChange={onPayload} />
            </View>
            <Footer>
                <Button title="확인" onPress={onSubmit} />
            </Footer>
        </View>
    );
}

function useStyle() {
    return StyleSheet.create({
        PushContainer: {
            flex: 1,
            backgroundColor: "#fff",
        },
        PushContent: {
            flex: 1,
            paddingTop: 40,
            paddingHorizontal: 20,
        },
    });
}
