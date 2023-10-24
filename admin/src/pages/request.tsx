import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue, useSetAtom } from 'jotai';
import ExternalLink from '@/components/ExternalLink';
import { useState } from 'react';
import styled from '@emotion/styled';
import { numComma } from '@/utils/common';
import { postAnswerAtom, requestsAtom, getRequestAtom } from '@/stores/request/atoms';
import { PostAnswerParams, Product } from '@/stores/request/types';

const ExternalLinkUnderline = styled(ExternalLink)`
  text-decoration: underline;
`;

const tabName = {
  'RECOMMEND': '픽포미 추천',
  'RESEARCH': '픽포미 분석',
  'BUY': '',
}

const ProductNew: React.FC<{ product: Product, removeProduct: () => void, setProduct: (product: Product) => void  }> = ({ product, setProduct, removeProduct }) => {
  const handleChangeInput: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    let value: string | string[] | undefined = e.target.value;
    if (e.target.name === 'tags') {
      if (value.length) {
        value = value.split('\n').map(v => v.trim());
      } else {
        value = undefined;
      }
    } else {
      value = value.trim();
    }
    setProduct({
      ...product,
      [e.target.name]: value,
    });
  }
  return (
      <ProductCard>
        <RemoveButton type='button' onClick={removeProduct}>삭제</RemoveButton>
        상품명
        <Row>
          <ProductInput name='title' type='text' value={product.title} onChange={handleChangeInput} />
        </Row>
        가격
        <Row>
          <ProductInput name='price' type='number' value={product.price} onChange={handleChangeInput}/>
        </Row>
        태그
        <Row>
          <ProductTagArea name='tags' value={product.tags?.join('\r\n')} placeholder='줄바꿈으로 구분' onChange={handleChangeInput}/>
        </Row>
        설명
        <Row>
          <ProductTextArea name='desc' value={product.desc} onChange={handleChangeInput}/>
        </Row>
        구매링크
        <Row>
          <ProductInput name='url' type='text' value={product.url} onChange={handleChangeInput}/>
        </Row>
      </ProductCard>
  );
}

const ProductItem: React.FC<{ product: Product }> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Root onClick={() => setIsOpen(true)}>
      <ProductCard>
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
      </ProductCard>
    </Root>
  );
}

const initialProduct = {
  title: '',
  desc: '',
  url: '',
  price: 0,
  tags: [''],
}

const initialAnswer = { text: '', products: [] };
export default function RequestScreen() {
  const router = useRouter();
  const requestId = router.query.requestId as string;
  const getRequest = useSetAtom(getRequestAtom);
  const postAnswer = useSetAtom(postAnswerAtom);
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  const [answer, setAnswer] = useState<PostAnswerParams['answer']>({ ...initialAnswer });
  useEffect(() => {
    if (requestId) {
      getRequest({ requestId });
    }
  }, [requestId, getRequest]);

  const handleSubmitAnswer = () => {
    postAnswer({
      answer,
      requestId,
    });
    setAnswer({ ...initialAnswer });
  }

  const handleChangeAnswerText: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setAnswer((prev) => ({ ...prev, text: e.target.value }));
  }

  const handleClickAddProduct = () => {
    setAnswer((prev) => ({ ...prev, products: [...prev.products, { ...initialProduct }] }));
  }

  const handleClickRemoveProduct = (i: number) => {
    setAnswer((prev) => ({
      ...prev,
      products: prev.products.filter((_, idx) => i !== idx),
    }));
  }

  const handleChangeProduct = (i: number) => (product: Product) => {
    setAnswer((prev) => ({
      ...prev,
      products: prev.products.map((prevProduct, idx) => i === idx ? product : prevProduct),
    }));
  }

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
      {request.type === 'RECOMMEND' && (
      <>
        <Subtitle>
          가격대
        </Subtitle>
        <Desc>
          {request.price}
        </Desc>
      </>
      )}
      {request.type === 'RESEARCH' && (
      <>
        <Subtitle>
          의뢰한 페이지 주소
        </Subtitle>
        <Desc>
          <ExternalLinkUnderline href={request.link}>
            {request.link}
          </ExternalLinkUnderline>
        </Desc>
      </>
      )}
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
              <ProductItem key={`answer-product-${product.url}}`} product={product} />
            ))}
          </ProductWrap>
        </>
      ) : (null)}

        <>
          <Desc>
            답변을 작성해주세요
          </Desc>
          <AnswerTextarea onChange={handleChangeAnswerText} value={answer.text} />
          {answer.products.map((product, i) => (
            <ProductNew key={`answer-product-edit-${i}}`} product={product} setProduct={handleChangeProduct(i)} removeProduct={() => handleClickRemoveProduct(i)} />
          ))}
          <br />
          <button onClick={() => handleClickAddProduct()}>상품 추가</button>
          <br />
          <br />
          <button onClick={handleSubmitAnswer}>답변전송</button>
        </>
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
  max-width : 900px;
  justify-content: flex-start;
  margin : auto;
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
const ProductCard = styled.div`
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
const AnswerTextarea = styled.textarea`
  min-height: 150px;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin : 10px 0; 
`;
const RemoveButton = styled.button`
  display: block;
  margin-left: auto;
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

const ProductInput = styled.input`
  flex: 1;
  padding : 5px;
`

const ProductTagArea = styled.textarea`
  flex: 1;
  height: 80px;
  padding : 5px;
`

const ProductTextArea = styled.textarea`
  flex: 1;
  height: 120px;
  padding : 5px;
`