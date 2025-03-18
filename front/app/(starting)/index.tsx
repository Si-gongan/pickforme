import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { settingAtom } from "@stores";
import { Colors } from "../../constants/Colors";
import { Footer, Button } from "@components";

export default function StartingScreen() {
    // settingAtom에서 nickname 정보 가져오기
    const setting = useAtomValue(settingAtom);
    const nickname = setting?.name || "게스트";

    // 시작하기 버튼 클릭 시 실행될 함수
    const handleStart = () => {
        router.replace("/(tabs)");
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <View style={styles.content}>
                <Text style={{ width: "100%", height: "20%" }}></Text>
                <Text style={styles.welcomeText}>
                    {nickname}님, 안녕하세요.
                </Text>
                <Text style={{ width: "100%", height: 60 }}></Text>
                <Text style={styles.welcomeText}>시각장애인을 위한</Text>
                <Text style={{ width: "100%", height: 16 }}></Text>
                <Text style={styles.welcomeText}>쇼핑 서비스</Text>
                <Text style={{ width: "100%", height: 34 }}></Text>
                <Text style={styles.welcomeSubText}>
                    <Text style={styles.boldSystemText}>픽포미</Text>에 오신것을
                    환영합니다!
                </Text>
            </View>

            <View style={styles.footer}>
                <Button title="확인" onPress={handleStart} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "space-between",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: "4%",
    },
    logo: {
        width: 200,
        height: 200,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.light.text,
        textAlign: "center",
        marginTop: 16,
        marginBottom: 24,
        fontFamily: "Noto sans",
    },
    welcomeText: {
        fontSize: 22,
        width: "80%",
        fontWeight: "600",
        color: Colors.light.text,
        textAlign: "left",
        lineHeight: 26,
        fontFamily: "Noto sans",
    },
    welcomeSubText: {
        fontSize: 18,
        width: "80%",
        fontWeight: "400",
        color: Colors.light.text,
        textAlign: "left",
        fontFamily: "Noto sans",
    },
    boldSystemText: {
        fontWeight: "bold",
    },
    footer: {
        flex: 0.1,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: "center",
    },
});
