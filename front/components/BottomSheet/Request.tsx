import { useRef, useState, useEffect } from "react";
import {
    Platform,
    KeyboardAvoidingView,
    TextInput,
    StyleSheet,
    AccessibilityInfo,
    findNodeHandle,
} from "react-native";
import BottomSheet from "react-native-modal";

import { useAtom, useSetAtom, useAtomValue } from "jotai";

import { useColorScheme } from "@hooks";
import {
    requestBottomSheetAtom,
    addRequestAtom,
} from "../../stores/request/atoms";
import { isShowSubscriptionModalAtom } from "@stores";
import { scrapedProductDetailAtom } from "../../stores/product/atoms";
import { sendLogAtom } from "../../stores/log/atoms";

import { QuestionRequestParams, RequestType } from "../../stores/request/types";
import { Colors } from "@constants";
import { Text, View, Button } from "@components";
import { styles } from "./Base";
import useCheckMembership from "../../hooks/useCheckMembership";
import useCheckPoint from "../../hooks/useCheckPoint";

import type { ColorScheme } from "@hooks";

export default function ResearchBottomSheet() {
    const headerTitleRef = useRef(null);

    const isShowNonSubscribedModalVisible = useAtomValue(
        isShowSubscriptionModalAtom
    );

    const addRequest = useSetAtom(addRequestAtom);
    const colorScheme = useColorScheme();
    const localStyles = useLocalStyles(colorScheme);

    const scrapedProductDetail = useAtomValue(scrapedProductDetailAtom);

    const sendLog = useSetAtom(sendLogAtom);

    const [data, setData] = useState<Omit<QuestionRequestParams, "product">>({
        type: RequestType.QUESTION,
        text: "",
    });
    const checkMembership = useCheckMembership(
        (params: QuestionRequestParams) => {
            if (product) {
                addRequest(params);
            }
        }
    );
    const checkPoint = useCheckPoint((params: QuestionRequestParams) => {
        if (product) {
            addRequest(params);
        }
    });
    const handleSubmit = () => {
        const params = {
            ...data,
            product,
            images: scrapedProductDetail?.images,
            reviews: scrapedProductDetail?.reviews,
        } as QuestionRequestParams;
        onClose();
        checkPoint(params);
        sendLog({
            product: { url: product?.url },
            action: "request",
            metaData: {},
        });
    };
    const disabled = !data.text;
    const [product, setProduct] = useAtom(requestBottomSheetAtom);
    const onClose = () => {
        setData({ ...data, text: "" });
        setProduct(undefined);
    };

    useEffect(() => {
        const focusOnHeader = () => {
            const node = findNodeHandle(headerTitleRef.current);
            if (product && node) {
                AccessibilityInfo.setAccessibilityFocus(node);
            }
        };
        setTimeout(focusOnHeader, 500);
    }, [product]);

    if (isShowNonSubscribedModalVisible) {
        console.log("미구독자");
        return null;
    }
    return (
        <BottomSheet
            style={styles.base}
            isVisible={!!product}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={[styles.bottomSheet, localStyles.root]}>
                    <Text
                        style={[styles.title, localStyles.title]}
                        ref={headerTitleRef}
                    >
                        상품에 대해 궁금한 점을 자유롭게 적어주세요.
                    </Text>
                    <View style={localStyles.textAreaContainer}>
                        <TextInput
                            accessibilityRole="none"
                            accessibilityHint="텍스트 입력창"
                            style={[
                                localStyles.textArea,
                                localStyles.textAreaBig,
                            ]}
                            underlineColorAndroid="transparent"
                            numberOfLines={4}
                            textAlignVertical="top"
                            multiline
                            onChangeText={(text) => setData({ ...data, text })}
                        />
                    </View>
                    <Button
                        style={styles.button}
                        title="매니저에게 물어보기"
                        onPress={handleSubmit}
                        disabled={disabled}
                    />
                </View>
            </KeyboardAvoidingView>
        </BottomSheet>
    );
}

const useLocalStyles = (colorScheme: ColorScheme) =>
    StyleSheet.create({
        root: {
            paddingBottom: 40,
        },
        title: {
            fontSize: 14,
            lineHeight: 17,
            fontWeight: "400",
            marginBottom: 20,
            color: "#1e1e1e",
        },
        textAreaContainer: {
            width: "100%",
            borderColor: Colors[colorScheme].borderColor.primary,
            borderWidth: 1,
            padding: 5,
            marginBottom: 24,
        },
        textArea: {
            color: Colors[colorScheme].text.primary,
        },
        textAreaBig: {
            height: 116,
        },
        buttonText: {
            color: Colors[colorScheme].text.primary,
        },
    });
