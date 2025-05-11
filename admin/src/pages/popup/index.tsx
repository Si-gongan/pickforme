import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Button, Table, Modal, Form, Input, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAtom } from 'jotai';
import { usersAtom } from '@/stores/user/atoms';
import client from '@/utils/axios';

interface Popup {
  popup_id: string;
  title: string;
  description?: string;
}

export default function PopupManagement() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  
  // 팝업 목록 조회
  const fetchPopups = async () => {
    try {
      const { data } = await client.get('/popup');
      setPopups(data);
    } catch (error: any) {
      console.error('팝업 목록 조회 실패:', error);
      messageApi.error(error.response?.data?.error || '팝업 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  // 팝업 생성
  const handleCreate = async (values: any) => {
    try {
      const { data } = await client.post('/popup', values);

      if (data) {
        setIsModalVisible(false);
        form.resetFields();
        fetchPopups();
        messageApi.success('팝업이 성공적으로 생성되었습니다.');
      }
    } catch (error: any) {
      console.error('팝업 생성 실패:', error);
      messageApi.error(error.response?.data?.error || '팝업 생성에 실패했습니다.');
    }
  };

  // 팝업 삭제
  const handleDelete = async (popup_id: string) => {
    try {
      const { data } = await client.delete(`/popup/${popup_id}`);

      if (data) {
        fetchPopups();
        messageApi.success('팝업이 성공적으로 삭제되었습니다.');
      }
    } catch (error: any) {
      console.error('팝업 삭제 실패:', error);
      messageApi.error(error.response?.data?.error || '팝업 삭제에 실패했습니다.');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'popup_id',
      key: 'popup_id',
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '작업',
      key: 'action',
      render: (_: any, record: Popup) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.popup_id)}
        />
      ),
    },
  ];

  return (
    <Container>
      {contextHolder}
      <Header>
        <TitleContainer>
          <h1>팝업 관리</h1>
          <SubTitle>앱에서 보여줄 팝업 목록을 설정합니다.</SubTitle>
        </TitleContainer>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          새 팝업
        </Button>
      </Header>

      <Table
        columns={columns}
        dataSource={popups}
        rowKey="popup_id"
      />

      <Modal
        title="새 팝업 생성"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreate}
          layout="vertical"
        >
          <Form.Item
            name="popup_id"
            label="팝업 ID"
            rules={[{ required: true, message: '팝업 ID를 입력해주세요' }]}
            tooltip="앱에서 팝업을 구분해서 보여주기 위한 고유 ID입니다. 쉬운 id를 사용하되 기존 popup_id와 중복되지 않도록 해주세요."
          >
            <Input placeholder="event_hansiryun" />
          </Form.Item>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력해주세요' }]}
            tooltip="팝업을 구분하기 위한 제목입니다."
          >
            <Input placeholder="한시련 이벤트" />
          </Form.Item>
          <Form.Item
            name="description"
            label="설명"
            tooltip="팝업을 구분하기 위한 설명입니다."
          >
            <Input.TextArea placeholder="한시련 이벤트 팝업입니다." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              생성
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Container>
  );
}

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`; 