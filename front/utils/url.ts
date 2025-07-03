export const resolveRedirectUrl = async (url: string): Promise<string> => {
    try {
        return new Promise(async resolve => {
            try {
                const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
                resolve(response.url);
            } catch (error) {
                resolve(url); // 오류 발생 시 원래 URL 반환
            }
        });
    } catch (error) {
        return url; // 실패 시 원래 URL 반환
    }
};

// URL에서 유효한 https URL만 추출하는 함수
export const sanitizeUrl = (inputUrl: string): string => {
    try {
        if (!inputUrl || typeof inputUrl !== 'string') return '';

        // https: 또는 http:가 포함된 첫 번째 유효한 URL 부분 추출
        const httpsIndex = inputUrl.indexOf('https:');
        const httpIndex = inputUrl.indexOf('http:');

        let startIndex = -1;
        if (httpsIndex >= 0) {
            startIndex = httpsIndex;
        } else if (httpIndex >= 0) {
            startIndex = httpIndex;
        }

        if (startIndex >= 0) {
            return inputUrl.substring(startIndex);
        }

        return inputUrl;
    } catch (error) {
        console.error('URL 정리 중 오류:', error);
        return inputUrl;
    }
};

// URL을 정규화하여 비교 가능한 형태로 변환 (임시 파라미터 제거)
export const normalizeUrl = (url: string): string => {
    try {
        if (!url) return '';
        
        const urlObj = new URL(url);
        
        // 쿠팡 URL인 경우 필수 파라미터만 유지
        if (urlObj.hostname.includes('coupang.com')) {
            // 필수 파라미터 목록
            const essentialParams = ['itemId', 'vendorItemId'];
            
            // 새로운 URLSearchParams 생성
            const params = new URLSearchParams();
            
            // 필수 파라미터만 추가
            essentialParams.forEach(param => {
                const value = urlObj.searchParams.get(param);
                if (value) {
                    params.append(param, value);
                }
            });
            
            // 정규화된 URL 생성
            return `${urlObj.origin}${urlObj.pathname}?${params.toString()}`;
        }
        
        return url;
    } catch (error) {
        console.error('URL 정규화 중 오류:', error);
        return url;
    }
};
