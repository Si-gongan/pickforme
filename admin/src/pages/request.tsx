import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue, useSetAtom } from 'jotai';
import ExternalLink from '@/components/ExternalLink';
import { useState } from 'react';
import styled from '@emotion/styled';
import { numComma } from '@/utils/common';
import { requestsAtom, getRequestAtom } from '@/stores/request/atoms';
import { Product } from '@/stores/request/types';

const tabName = {
  'RECOMMEND': '픽포미 추천',
  'RESEARCH': '픽포미 분석',
  'BUY': '',
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Root onClick={() => setIsOpen(true)}>
      <Product key={`answer-product-${product.url}}`}>
        <Row>
          <ProductTitle>
            {product.title}
          </ProductTitle>
          <ProductPrice>
            {numComma(product.price)}
          </ProductPrice>
        </Row>
        <ProductTagWrap>
          {product.tags.map((tag) => (
            <ProductTag
              key={`answer-product-${product.url}-${tag}}`}
            >
              {tag}
            </ProductTag>
          ))}
        </ProductTagWrap>
        {isOpen && (
          <>
          <ProductDesc>
            {product.desc}
          </ProductDesc>
          <ButtonWrap>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              접기
            </Button>
            <ExternalLink href={product.url}>
              <Button>
                구매링크 이동
              </Button>
            </ExternalLink>
          </ButtonWrap>
          </>
        )}
      </Product>
    </Root>
  );
}

export default function RequestScreen() {
  const router = useRouter();
  const requestId = router.query.requestId as string;
  const getRequest = useSetAtom(getRequestAtom);
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  useEffect(() => {
    if (requestId) {
      getRequest({ requestId });
    }
  }, [requestId, getRequest]);
  if (!request) {
    return null;
  }

  return (
    <Container>
        <Title>
          {tabName[request.type]}
        </Title>
        <Subtitle>
          의뢰 내용
        </Subtitle>
        <Desc>
          {request.text}
        </Desc>
        <Subtitle>
          추천 결과
        </Subtitle>
        {request.answer ? (
          <>
            <Desc>
              {request.answer.text}
            </Desc>
            <ProductWrap>
              {request.answer.products.map((product) => (
                <ProductCard key={`answer-product-${product.url}}`} product={product} />
              ))}
            </ProductWrap>
          </>
        ) : (
          <Desc>
            매니저가 답변을 작성중입니다. 조금만 기다려주세요.
          </Desc>
        )}
    </Container>
  );
}

const Root = styled.button`
  border: none;
  background-color: transparent;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  justify-content: flex-start;
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  margin-bottom: 30px;
`;
const Subtitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  margin-bottom: 18px;
`;
const Desc = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  margin-bottom: 26px;
`;
const ProductWrap = styled.div`
  display: flex;
  margin-top: 9px;
  flex-direction: column;
`;
const Product = styled.div`
  border: 2px solid black;
  border-radius: 13px;
  padding: 16px 13px;
`;
const ProductTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  margin-bottom: 8px;
`;
const ProductPrice = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  margin-bottom: 8px;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
const ProductTagWrap = styled.div`
  display: flex;
  flex-direction: row;
  gap: 9px;
`;
const ProductTag = styled.div`
  padding: 0 12px;
`;
const ProductDesc = styled.div`
  text-align: left;
  margin-top: 10px;
  margin-bottom: 12px;
`;
const ButtonWrap = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-end;
`;
const Button = styled.button`
  padding: 0 12px;
`;
