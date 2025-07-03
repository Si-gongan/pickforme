import React, { useEffect, useRef } from 'react';
import { StyleSheet, View as RNView, findNodeHandle, AccessibilityInfo, InteractionManager } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { View } from '@components';
import useColorScheme from '../../../hooks/useColorScheme';
import { Colors } from '@constants';
import { ProductDetailState } from '../../../stores/product/types';

interface ReportTabProps {
    productDetail: ProductDetailState;
    isTabPressed: boolean;
}

const ReportTab: React.FC<ReportTabProps> = ({ productDetail, isTabPressed }) => {
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

    // 보고서 내용 준비
    const reportContent = productDetail?.report || '상품 분석 내용이 없습니다.';

    // 마크다운 태그 제거하여 읽기 용이한 텍스트 생성
    const plainText = reportContent.replace(/#+\s|\*\*|\*|__|_|~~|`|\[|\]\(.*?\)|\|/g, '');

    return (
        <View
            style={styles.detailWrap}
            ref={contentRef}
            accessible={true}
            accessibilityLabel={`리포트 내용: ${plainText}`}
            importantForAccessibility="yes"
        >
            <Markdown style={markdownStyles}>{reportContent}</Markdown>
            {/* 보이스오버를 위한 감춰진 텍스트 */}
            <RNView
                style={{ height: 1, width: 1, overflow: 'hidden' }}
                accessible={true}
                accessibilityLabel={plainText}
            />
        </View>
    );
};

const useStyles = (colorScheme: any) =>
    StyleSheet.create({
        detailWrap: {
            padding: 28
        }
    });

export default ReportTab;
