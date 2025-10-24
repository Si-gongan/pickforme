import { Product } from '@/stores/product/types';

/**
 * 값이 유효한지 확인하는 헬퍼 함수
 */
function isValidValue(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return !isNaN(value) && isFinite(value);
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

/**
 * Product 객체의 특정 필드가 유효한 값인지 확인하는 함수
 */
function isValidProductField(field: keyof Product, value: any): boolean {
    switch (field) {
        case 'name':
        case 'url':
        case 'thumbnail':
        case 'platform':
            return typeof value === 'string' && value.trim() !== '';

        case 'price':
        case 'origin_price':
            return typeof value === 'number' && value > 0;

        case 'discount_rate':
        case 'reviews':
        case 'ratings':
            return value === null || (typeof value === 'number' && value >= 0);

        case 'detail_images':
            return value === undefined || (Array.isArray(value) && value.length > 0);

        default:
            return isValidValue(value);
    }
}

/**
 * 기존 Product와 새로운 데이터를 병합하되, 유효한 값만 업데이트하는 함수
 * @param existingProduct 기존 Product 객체
 * @param newData 새로운 데이터 (Partial<Product>)
 * @returns 병합된 Product 객체
 */
export function mergeProductData(existingProduct: Product, newData: Partial<Product>): Product {
    const result: Product = { ...existingProduct };

    // 각 필드에 대해 유효성 검사 후 업데이트
    for (const [key, value] of Object.entries(newData)) {
        const field = key as keyof Product;

        // 유효한 값인 경우에만 업데이트
        if (isValidProductField(field, value)) {
            (result as any)[field] = value;
        }
    }

    return result;
}

/**
 * Product 배열에서 유효한 필드 통계를 계산하는 함수
 * @param products Product 배열
 * @returns 필드별 유효성 통계
 */
export function computeProductFieldStats(products: Product[]) {
    const total = products.length;

    const stats = {
        total,
        name: 0,
        price: 0,
        origin_price: 0,
        discount_rate: 0,
        reviews: 0,
        ratings: 0,
        url: 0,
        thumbnail: 0,
        platform: 0,
        detail_images: 0
    };

    for (const product of products) {
        for (const field of Object.keys(stats) as Array<keyof typeof stats>) {
            if (field === 'total') continue;

            const productField = field as keyof Product;
            if (isValidProductField(productField, product[productField])) {
                stats[field]++;
            }
        }
    }

    return stats;
}
