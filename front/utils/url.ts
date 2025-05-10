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
