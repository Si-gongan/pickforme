import React from 'react';
import TabContent from './product-detail/TabContent';

// 기존 복잡한 TabContent를 리팩토링된 컴포넌트로 단순화
const ProductDetailTabContent: React.FC<any> = props => {
    return <TabContent {...props} />;
};

export default ProductDetailTabContent;
