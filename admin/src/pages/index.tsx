import React from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import styled from '@emotion/styled';

import { RequestStatus } from '@/stores/request/types';
import { getRequestsAtom, requestsAtom } from '@/stores/request/atoms';
import { formatDate } from '@/utils/common';

enum TABS {
  ALL = 'ALL',
  RECOMMEND = 'RECOMMEND',
  RESEARCH = 'RESEARCH',
  QUESTON = 'QUESTION',
};

const tabName = {
  [TABS.ALL]: '전체',
  [TABS.RECOMMEND]: '픽포미 추천',
  [TABS.RESEARCH]: '픽포미 분석',
  [TABS.QUESTON]: '픽포미 질문',
}
export default function RequestsScreen() {
  const [tab, setTab] = React.useState<TABS>(TABS.ALL);
  const getRequests = useSetAtom(getRequestsAtom);
  const requests = useAtomValue(requestsAtom).filter(request => tab === 'ALL' ? true : request.type === tab);

  React.useEffect(() => {
    getRequests({});
  }, [getRequests]);

  return (
    <Container>
      <Title>의뢰 목록</Title>
      <Subtitle>아래 탭을 선택하여 채팅을 모아서 보세요.</Subtitle>
      <TabWrap>
        {Object.values(TABS).map((TAB) => (
          <Tab key={`Requests-Tab-${TAB}`} onClick={() => setTab(TAB)}>
            {tabName[TAB]}
          </Tab>
        ))}
      </TabWrap>
      <Cards>
        {requests.map((request) => (
          <Link
            href={`/chat/?requestId=${request._id}`}
            key={`Request-card-${request._id}`}
          >
            <Card>
              <Row>
                <RowLeft>
                  <Name>
                    {request.name}
                  </Name>
                  <DateText>
                    {formatDate(request.createdAt)}
                  </DateText>
                </RowLeft>
                <Chip
                  status={request.status}
                >
                  {request.status}
                </Chip>
              </Row>
              <div>
                {request.chats.slice(-1)?.[0]?.text || ''}
              </div>
            </Card>
          </Link>
        ))}
      </Cards>
    </Container>
  );
}

const Chip = styled.div<{ status: RequestStatus }>`
`;

const Container = styled.div`
  width: 100%;
  padding: 20px;
  padding-top: 50px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 22px;
  line-height: 27px;
  margin-bottom: 13px;
`;

const Subtitle = styled.div`
  font-weight: 500;
  font-size: 14px
  line-height: 17px;
  margin-bottom: 32px;
`;
const TabWrap = styled.div`
  flex-direction: row;
  align-content: stretch;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
`;
const Tab = styled.button`
  flex: 1;
`;
const Cards = styled.div`
  flex-direction: column-reverse;
`;
const Card = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 2px solid black;
  margin-bottom: 13px;
`;
const Row = styled.div`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;
const RowLeft = styled.div`
  flex-direction: row;
  align-items: center;
`;
const Name = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  margin-right: 9px;
`;
const DateText = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
`;
const Preview = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
`;

const Status = styled.div`
  padding-left: 18px;
  padding-right: 18px;
`;
