import { useAtomValue, useSetAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';
import { userDataAtom } from '@/stores/auth/atoms';
import { sendChatAtom, requestsAtom } from '@/stores/request/atoms';
import { SendChatParams, RequestStatus } from '@/stores/request/types';
import styled from '@emotion/styled';
import Chat from '@/components/Chat';

export default function ChatScreen() {
  const router = useRouter();
  const scrollDivRef = useRef<HTMLDivElement | null>(null);

  const userData = useAtomValue(userDataAtom);
  const requestId = router.query.request_id;
  const sendChat = useSetAtom(sendChatAtom);
  const [data, setData] = useState<SendChatParams>({
    text: '',
    requestId: requestId as string, // local search params 이슈
  });
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  const handleClickSend = () => {
    sendChat(data);
    setData({ ...data, text: '' });
  }
  if (!request) {
    return <div>잘못된 접근입니다</div>
  }
  return (
    <Container>
      <Room
        ref={scrollDivRef}
      >
        {request.chats.map((chat) => <Chat key={`Chat-${chat._id}`} data={chat} />)}
      </Room>
      {request.status === RequestStatus.CLOSED ? (
        <ClosedDiv>
          채팅이 종료되었습니다.
        </ClosedDiv>
      ) : (
      <InputDiv>
        <InputWrap>
          <Textarea
            value={data.text}
            onChange={(e) => setData({ ...data, text: e.target.value })}
          />
          <SendButton
            onClick={handleClickSend}
          >
            <SendIcon src='/images/chat/send.png' />
          </SendButton>
        </InputWrap>
      </InputDiv>
      )}
    </Container>
  );
}

const Container = styled.div`
  flex: 1,
  flex-direction: column;
`;
const Room = styled.div`
  padding: 20px;
  flex-direction: column;
  justify-content: flex-end;
`;

const InputDiv = styled.div`
  border-top: 2px solid black;
  display: flex;
  flex-direction: row;
  padding: 14px 21px 32px 21px;
  gap: 10px;
`;
const InputWrap = styled.div`
  display: flex;
  flex: 1;
  min-height: 31px;
  pading: 3px 15px 3px 4px;
  border-radius: 18px;
  align-items: flex-end;
  justify-content: space-between;
  background-color: white;
  flex-direction: row;
`;
const SendButton = styled.button`
  width: 52px;
  height: 31px;
  border: 0;
  justify-content: center;
  align-items: center;
  background-color: black;
`;
 const Textarea = styled.textarea`
  flex: 1;
  font-size: 14px;
 `;
const SendIcon = styled.img`
`;
const ClosedDiv = styled.div`
  text-align: center;
  align-items: center;
  font-weight: 600;
  margin-top: 20px;
  font-size: 12px;
  line-height: 15px;
  margin-bottom: 39px;
`;
