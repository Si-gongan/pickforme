// pages/crawl-log/index.tsx
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Table, Tag, Button, Tooltip, Space } from "antd";
import { useRouter } from "next/router";
import axios from "@/utils/axios";

type ProcessType = "webview-detail" | "webview-review" | "server";

interface ProcessCell {
  success: boolean;
  durationMs: number;
  logId: string;
}
interface GroupedLog {
  requestId: string;
  productUrl: string;
  processes: Partial<Record<ProcessType, ProcessCell>>;
  // 서버에서 lastCreatedAt을 같이 내려주면 정렬/표시에도 활용 가능
  // lastCreatedAt?: string;
}

interface ListResp {
  results: GroupedLog[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export default function CrawlLogListPage() {
  const [data, setData] = useState<ListResp>({
    results: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchLogs = async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      // ✅ 서버: /crawl-logs/list-grouped (requestId 단위 페이지네이션)
      const { data } = await axios.get<ListResp>("/crawl-logs/list-grouped", {
        params: { page, limit },
      });
      setData({
        results: data.results ?? [],
        total: data.total ?? 0,
        page: data.page ?? page,
        limit: data.limit ?? limit,
        totalPages: data.totalPages,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, 20);
  }, []);

  const renderProcess = (p?: ProcessCell) => {
    if (!p) return <Tag>-</Tag>;
    return (
      <Tooltip title={`${p.durationMs}ms`}>
        <Tag color={p.success ? "green" : "red"}>
          {p.success ? "성공" : "실패"}
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "requestId",
      key: "requestId",
    },
    {
      title: "상품 URL",
      dataIndex: "productUrl",
      key: "productUrl",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url.length > 40 ? `${url.slice(0, 37)}...` : url}
        </a>
      ),
    },
    {
      title: "웹뷰 상세",
      key: "webview-detail",
      render: (_: any, record: GroupedLog) =>
        renderProcess(record.processes["webview-detail"]),
    },
    {
      title: "웹뷰 리뷰",
      key: "webview-review",
      render: (_: any, record: GroupedLog) =>
        renderProcess(record.processes["webview-review"]),
    },
    {
      title: "서버 크롤링",
      key: "server",
      render: (_: any, record: GroupedLog) =>
        renderProcess(record.processes["server"]),
    },
    {
      title: "상세",
      key: "action",
      render: (_: any, record: GroupedLog) => (
        <Button onClick={() => router.push(`/crawl-log/${record.requestId}`)}>
          상세 보기
        </Button>
      ),
    },
  ];

  return (
    <Container>
      <TopBar>
        <TitleSection>
          <h1>크롤링 요청 로그</h1>
        </TitleSection>
        <ButtonGroup>
          <Button
            onClick={() => fetchLogs(data.page, data.limit)}
            loading={loading}
          >
            🔄 새로고침
          </Button>
          <Button onClick={() => router.push("/crawl-log/stats")}>통계</Button>
        </ButtonGroup>
      </TopBar>

      <TableSection>
        <Table
          rowKey="requestId"
          columns={columns}
          dataSource={data.results}
          loading={loading}
          pagination={{
            current: data.page,
            pageSize: data.limit,
            total: data.total,
            showSizeChanger: true,
            onChange: (page, pageSize) => fetchLogs(page, pageSize),
          }}
        />
      </TableSection>
    </Container>
  );
}

const Container = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const TitleSection = styled.div`
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #262626;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const TableSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .ant-table {
    border-radius: 8px;
  }
  .ant-table-thead > tr > th {
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px;
  }
  .ant-table-tbody > tr > td {
    padding: 16px;
  }
`;
