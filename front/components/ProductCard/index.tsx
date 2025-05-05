import { forwardRef, useCallback, useMemo } from 'react';
import { Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { getNumberComma } from '@utils';
import useStyle from './style';
import type { ForwardedRef } from 'react';
import type { IProductCardProps } from './type';

export default forwardRef(function ProductCard({ data, type = '' }: IProductCardProps, ref: ForwardedRef<View>) {
    const router = useRouter();
    const styles = useStyle();

    const isBase = useMemo(
        function () {
            return !['liked', 'request'].includes(type || '') && !!data.ratings;
        },
        [type, data]
    );

    const label = useMemo(
        function () {
            const mainLabel = `${data.name ?? ''} ${getNumberComma(data.price ?? 0)}원`;

            if (isBase) {
                return `${mainLabel} ${(data.discount_rate ?? 0) !== 0 ? `할인률 ${data.discount_rate}%` : ''} 리뷰 ${
                    data.reviews
                }개 평점 ${Math.floor((data.ratings / 20) * 10) / 10}점`;
            }

            return mainLabel;
        },
        [isBase, data]
    );

    const onPress = useCallback(function () {
        router.push(`/product-detail?url=${encodeURIComponent(data.url)}`);
    }, []);

    return (
        <Pressable
            ref={ref}
            accessible
            accessibilityRole="button"
            accessibilityLabel={label}
            style={styles.ProductCard}
            onPress={onPress}
        >
            <View style={[styles.ProductCardContent, isBase && styles.ProductCardContentColumn]}>
                {isBase ? (
                    <View style={styles.ProductCardContentRow}>
                        <View style={styles.ProductCardTitleColumn}>
                            {data.reviews > 0 && data.ratings > 0 && (
                                <Text
                                    style={[styles.ProductCardReviews, { color: 'black', fontWeight: '400' }]}
                                    accessible
                                >
                                    리뷰 {data.reviews}개 평점 {Math.floor((data.ratings / 20) * 10) / 10}점
                                </Text>
                            )}
                            <Text numberOfLines={1} style={styles.ProductCardName} accessible>
                                {data.name}
                            </Text>
                        </View>
                        <View
                            style={{
                                width: '30%',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-end'
                            }}
                        >
                            {data.discount_rate > 0 && (
                                <Text style={styles.ProductCardDiscount} accessible>
                                    {data.discount_rate}%
                                </Text>
                            )}
                            <View style={{ marginLeft: 5 }}>
                                <Text style={styles.ProductCardPrice} accessible>
                                    {getNumberComma(data.price ?? 0)}원
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.ProductCardContentRow}>
                        <View style={styles.ProductCardTitleColumn}>
                            {data.reviews > 0 && data.ratings > 0 && (
                                <Text style={styles.ProductCardReviews} accessible>
                                    리뷰 {data.reviews}개 평점 {Math.floor((data.ratings / 20) * 10) / 10}점
                                </Text>
                            )}
                            <Text style={styles.ProductCardName} accessible>
                                {data.name}
                            </Text>
                        </View>
                        <Text style={styles.ProductCardPrice} accessible>
                            {getNumberComma(data.price ?? 0)}원
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
});
