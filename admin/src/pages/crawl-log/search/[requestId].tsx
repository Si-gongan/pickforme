import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Table, Tag, Button, Space, Typography } from "antd";
import { useRouter } from "next/router";
import axios from "@/utils/axios";

type SearchSource = "webview" | "server";

interface SearchLog {
  _id?: string;
  requestId: string;
  keyword: string;
  source: SearchSource;
  success: boolean;
  durationMs: number;
  resultCount: number;
  errorMsg?: string;
  createdAt: string;
}

interface ListRespRaw {
  results: SearchLog[];
  total: number;
  page: number;
  limit: number;
}

export default function SearchLogDetailPage() {
  const router = useRouter();
  const { requestId } = router.query as { requestId: string };
  const [rows, setRows] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      // requestId 필터 사용 (백엔드 /search-logs/list 가 requestId 쿼리 지원)
      const { data } = await axios.get<ListRespRaw>("/search-logs/list", {
        params: { requestId, limit: 100 },
      });
      setRows(
        (data.results || []).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [requestId]);

  const columns = [
    { title: "시간", dataIndex: "createdAt", key: "createdAt", width: 200 },
    {
      title: "소스",
      dataIndex: "source",
      key: "source",
      width: 120,
      render: (s: SearchSource) => (
        <Tag color={s === "webview" ? "blue" : "gold"}>{s}</Tag>
      ),
    },
    {
      title: "성공",
      dataIndex: "success",
      key: "success",
      width: 120,
      render: (ok: boolean) => (
        <Tag color={ok ? "green" : "red"}>{ok ? "성공" : "실패"}</Tag>
      ),
    },
    {
      title: "소요(ms)",
      dataIndex: "durationMs",
      key: "durationMs",
      width: 120,
    },
    {
      title: "결과수",
      dataIndex: "resultCount",
      key: "resultCount",
      width: 120,
    },
    { title: "키워드", dataIndex: "keyword", key: "keyword" },
    { title: "에러", dataIndex: "errorMsg", key: "errorMsg", ellipsis: true },
  ];

  const meta = rows[0];

  return (
    <Container>
      <TopBar>
        <Space size={12}>
          <Button onClick={() => router.back()}>← 뒤로</Button>
          <Typography.Title level={3} style={{ margin: 0 }}>
            검색 요청 상세: {requestId}
          </Typography.Title>
        </Space>
        <Space>
          <Button onClick={() => fetchDetail()} loading={loading}>
            🔄 새로고침
          </Button>
        </Space>
      </TopBar>

      <MetaBox>
        <div>
          <b>키워드:</b> {meta?.keyword || "-"}
        </div>
        <div>
          <b>총 이벤트:</b> {rows.length}
        </div>
      </MetaBox>

      <Table
        rowKey={(r) => r._id || `${r.source}-${r.createdAt}`}
        dataSource={rows}
        columns={columns as any}
        loading={loading}
        pagination={false}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
`;
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;
const MetaBox = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;
