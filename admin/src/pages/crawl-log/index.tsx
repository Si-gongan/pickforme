import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Table, Tag, Button, Tooltip, Space } from "antd";
import { useRouter } from "next/router";
import axios from "@/utils/axios";

type ProcessType = "webview-detail" | "webview-review" | "server";

interface CrawlLog {
  _id: string;
  requestId: string;
  productUrl: string;
  processType: ProcessType;
  success: boolean;
  durationMs: number;
  createdAt: string;
}

interface GroupedLog {
  requestId: string;
  productUrl: string;
  processes: Partial<
    Record<ProcessType, { success: boolean; durationMs: number; logId: string }>
  >;
}

export default function CrawlLogListPage() {
  const [groupedLogs, setGroupedLogs] = useState<GroupedLog[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/crawl-logs/list");
      const logs: CrawlLog[] = data.results;

      const grouped: Record<string, GroupedLog> = {};

      for (const log of logs) {
        const { requestId, productUrl, processType, success, durationMs, _id } =
          log;

        if (!grouped[requestId]) {
          grouped[requestId] = {
            requestId,
            productUrl,
            processes: {},
          };
        }

        grouped[requestId].processes[processType] = {
          success,
          durationMs,
          logId: _id,
        };
      }

      setGroupedLogs(Object.values(grouped));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const renderProcess = (
    processData:
      | { success: boolean; durationMs: number; logId: string }
      | undefined
  ) => {
    if (!processData) return <Tag>-</Tag>;

    return (
      <Tooltip title={`${processData.durationMs}ms`}>
        <Tag color={processData.success ? "green" : "red"}>
          {processData.success ? "성공" : "실패"}
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
          <Button onClick={fetchLogs} loading={loading}>
            🔄 새로고침
          </Button>
          <Button onClick={() => router.push("/crawl-log/stats")}>통계</Button>
        </ButtonGroup>
      </TopBar>

      <TableSection>
        <Table
          rowKey="requestId"
          columns={columns}
          dataSource={groupedLogs}
          loading={loading}
          pagination={{ pageSize: 10 }}
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
