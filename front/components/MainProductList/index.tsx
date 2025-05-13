/**
 * 홈 화면 메인 상품 노출
 * - 기본적으로 랜덤 카테고리 상품 노출
 */
import { useState, useCallback } from 'react';
import { ScrollView, FlatList, View, Text } from 'react-native';

import ProductCard from '../ProductCard';
import MoreButton from '../MoreButton';
import useStyle from './style';

// GetMainProductsResponse 타입 유지를 위한 import
import { MainProductsState } from '../../stores/product/types';

// props 타입 정의
interface MainProductListProps {
    data: MainProductsState;
    category: string;
}

export default function MainProductList({ data, category }: MainProductListProps) {
    const [randomCount, onRandomCount] = useState<number>(5);
    const [specialCount, onSpecialCount] = useState<number>(5);

    const style = useStyle();

    const onMore = useCallback(
        function (type: 'special' | 'random') {
            switch (type) {
                case 'special':
                    onSpecialCount(function (prev) {
                        return Math.min(prev + 5, data.special.length);
                    });
                    break;
                case 'random':
                    onRandomCount(function (prev) {
                        return Math.min(prev + 5, data.random.length);
                    });
                    break;
            }
        },
        [data]
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {data.local
                .filter(function ({ order }) {
                    return order < 0;
                })
                .sort(function (a, b) {
                    return a.order - b.order;
                })
                .map(function (item) {
                    return (
                        <View style={style.MainProductSection} key={`discover-main-section-${item.name}-${item.order}`}>
                            <Text style={[style.MainProductSectionTitle]} accessible accessibilityRole="header">
                                {item.name}
                            </Text>
                        </View>
                    );
                })}

            {data.random.length > 0 && (
                <View style={style.MainProductSection}>
                    <Text style={[style.MainProductSectionTitle]} accessible accessibilityRole="header">
                        {category}
                    </Text>

                    <FlatList
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        contentContainerStyle={[style.MainProductSectionListContent]}
                        data={data.random.slice(0, randomCount)}
                        keyExtractor={function (item) {
                            return `random-${item.url}`;
                        }}
                        ItemSeparatorComponent={() => (
                            <View style={style.MainProductSectionSeparator} accessible={false} />
                        )}
                        renderItem={function ({ item }) {
                            return <ProductCard data={item} />;
                        }}
                        ListFooterComponentStyle={style.MainProductSectionListFooter}
                        ListFooterComponent={function () {
                            return (
                                data.random.length > randomCount && (
                                    <MoreButton
                                        onPress={function () {
                                            onMore('random');
                                        }}
                                    />
                                )
                            );
                        }}
                    />
                </View>
            )}

            {data.special.length > 0 && (
                <View style={style.MainProductSection}>
                    <Text style={[style.MainProductSectionTitle]} accessible accessibilityRole="header">
                        오늘의 특가 상품
                    </Text>

                    <FlatList
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        contentContainerStyle={[style.MainProductSectionListContent]}
                        data={data.special.slice(0, specialCount)}
                        keyExtractor={function (item) {
                            return `special-${item.url}`;
                        }}
                        ItemSeparatorComponent={() => (
                            <View style={style.MainProductSectionSeparator} accessible={false} />
                        )}
                        renderItem={function ({ item }) {
                            return <ProductCard data={item} />;
                        }}
                        ListFooterComponentStyle={style.MainProductSectionListFooter}
                        ListFooterComponent={function () {
                            return (
                                data.special.length > specialCount && (
                                    <MoreButton
                                        onPress={function () {
                                            onMore('special');
                                        }}
                                    />
                                )
                            );
                        }}
                    />
                </View>
            )}
        </ScrollView>
    );
}
