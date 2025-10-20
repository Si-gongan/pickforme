import React, { useEffect, useRef } from 'react';
import { StyleSheet, View as RNView, findNodeHandle, AccessibilityInfo, InteractionManager } from 'react-native';
import { Text, View } from '@components';
import useColorScheme, { ColorScheme } from '../../../hooks/useColorScheme';
import { Colors } from '@constants';
import { ProductDetailState } from '../../../stores/product/types';

interface CaptionTabProps {
    productDetail: ProductDetailState;
    isTabPressed: boolean;
}

const CaptionTab: React.FC<CaptionTabProps> = ({ productDetail, isTabPressed }) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const contentRef = useRef<RNView>(null);

    const markdownStyles = StyleSheet.create({
        text: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });

    useEffect(() => {
        if (contentRef.current && isTabPressed) {
            const node = findNodeHandle(contentRef.current);
            if (node) {
                InteractionManager.runAfterInteractions(() => {
                    setTimeout(() => {
                        AccessibilityInfo.setAccessibilityFocus(node);
                    }, 500);
                });
            }
        }
    }, [contentRef.current, isTabPressed]);

    // 캡션 내용 준비
    const captionContent = productDetail?.caption || '상품 설명 내용이 없습니다.';

    // 마크다운 태그 제거하여 읽기 용이한 텍스트 생성
    const plainText = captionContent.replace(/#+\s|\*\*|\*|__|_|~~|`|\[|\]\(.*?\)|\|/g, '');

    return (
        <View
            style={styles.detailWrap}
            ref={contentRef}
            accessible={true}
            accessibilityLabel={`캡션 내용: ${plainText}`}
            importantForAccessibility="yes"
        >
            {/* <Markdown style={markdownStyles}>{captionContent}</Markdown> */}
            <Text style={styles.captionText}>{captionContent}</Text>
        </View>
    );
};

const useStyles = (colorScheme: ColorScheme) =>
    StyleSheet.create({
        detailWrap: {
            // padding: 28
        },
        captionText: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });

export default CaptionTab;
