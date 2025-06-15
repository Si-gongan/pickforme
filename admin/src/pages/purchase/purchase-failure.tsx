import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  Button,
  Table,
  Input,
  DatePicker,
  Form,
  Space,
  message,
  Tag,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import axios from "@/utils/axios";

const { RangePicker } = DatePicker;

export default function PurchaseFailures() {
  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingIds, setRetryingIds] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchFailures = async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/purchase/failures", {
        params: filters,
      });
      setFailures(data.results);
    } catch (error: any) {
      console.error(error);
      messageApi.error("결제 실패 이력을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (values: any) => {
    const { userId, productId, dateRange } = values;
    const filters: any = {
      userId: userId || undefined,
      productId: productId || undefined,
    };
    if (dateRange?.[0] && dateRange?.[1]) {
      filters.startDate = format(dateRange[0].toDate(), "yyyy-MM-dd");
      filters.endDate = format(dateRange[1].toDate(), "yyyy-MM-dd");
    }
    fetchFailures(filters);
  };

  const handleRetry = async (record: any) => {
    try {
      setRetryingIds((prev) => [...prev, record._id]);
      const { data } = await axios.post("/purchase/retry", {
        userId: record.userId,
        _id: record.productId,
        receipt: record.receipt,
      });
      messageApi.success(
        `재시도 성공: ${data?.product?.displayName || "Success"}`
      );
      const filters = form.getFieldsValue();
      onSearch(filters);
    } catch (error: any) {
      console.error(error);
      messageApi.error(
        `재시도 실패: ${error.response?.data?.error || "Unknown error"}`
      );
    } finally {
      setRetryingIds((prev) => prev.filter((id) => id !== record._id));
    }
  };

  useEffect(() => {
    fetchFailures();
  }, []);

  const columns = [
    {
      title: "유저 ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "상품 ID",
      dataIndex: "productId",
      key: "productId",
    },
    {
      title: "에러 메시지",
      dataIndex: "errorMessage",
      key: "errorMessage",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "RESOLVED" ? "green" : "red"}>
          {status === "RESOLVED" ? "RESOLVED" : "FAILED"}
        </Tag>
      ),
    },
    {
      title: "발생 시각",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "작업",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<ReloadOutlined />}
          disabled={
            record.status === "RESOLVED" || retryingIds.includes(record._id)
          }
          onClick={() => handleRetry(record)}
        >
          {retryingIds.includes(record._id) ? "재시도 중..." : "재시도"}
        </Button>
      ),
    },
  ];

  return (
    <Container>
      {contextHolder}
      <h1>결제 실패 이력</h1>

      <Form
        form={form}
        onFinish={onSearch}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="userId">
          <Input placeholder="User ID" />
        </Form.Item>
        <Form.Item name="productId">
          <Input placeholder="Product ID" />
        </Form.Item>
        <Form.Item name="dateRange">
          <RangePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            검색
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={failures}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 24px;
`;
