import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Card, Descriptions, Table, Tag, Typography, Button } from "antd";
import { useRouter } from "next/router";
import axios from "@/utils/axios";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface ProcessStats {
  total: number;
  success: number;
  fail: number;
  successRate: number;
}

interface StatsResponse {
  todayStats: Record<string, ProcessStats>;
  byDateAndProcess: Record<string, Record<string, ProcessStats>>;
}

export default function CrawlLogStatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/crawl-logs/stats");
      setStats(data);
    } catch (e) {
      console.error("통계 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const processColumns = [
    {
      title: "프로세스",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "전체",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "성공",
      dataIndex: "success",
      key: "success",
      render: (val: number) => <Tag color="green">{val}</Tag>,
    },
    {
      title: "실패",
      dataIndex: "fail",
      key: "fail",
      render: (val: number) => <Tag color="red">{val}</Tag>,
    },
    {
      title: "성공률",
      dataIndex: "successRate",
      key: "successRate",
      render: (val: number) => `${val.toFixed(2)}%`,
    },
  ];

  const todayProcessData = stats
    ? Object.entries(stats.todayStats).map(([key, value]) => ({
        name: key,
        ...value,
      }))
    : [];

  const todayTotal = stats
    ? Object.values(stats.todayStats).reduce(
        (acc, curr) => {
          acc.total += curr.total;
          acc.success += curr.success;
          acc.fail += curr.fail;
          return acc;
        },
        { total: 0, success: 0, fail: 0 }
      )
    : { total: 0, success: 0, fail: 0 };

  const chartData = stats
    ? Object.entries(stats.byDateAndProcess)
        .map(([date, processes]) => ({
          date,
          webviewDetail: processes["webview-detail"]?.successRate ?? 0,
          webviewReview: processes["webview-review"]?.successRate ?? 0,
          server: processes["server"]?.successRate ?? 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return (
    <Container>
      <TopBar>
        <TitleSection>
          <Typography.Title level={2} style={{ margin: 0 }}>
            크롤링 통계
          </Typography.Title>
        </TitleSection>
        <Button onClick={() => router.push("/crawl-log")}>← 리스트로</Button>
      </TopBar>

      {stats && (
        <ContentSection>
          <StatsCard title="오늘 프로세스별 성공률" loading={loading}>
            <Table
              rowKey="name"
              columns={processColumns}
              dataSource={todayProcessData}
              pagination={false}
            />
          </StatsCard>

          <ChartCard title="일자별 성공률 (%)" loading={loading}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="webviewDetail"
                  name="Webview-Detail"
                  stroke="#1890ff"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="webviewReview"
                  name="Webview-Review"
                  stroke="#52c41a"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="server"
                  name="Server"
                  stroke="#9254de"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </ContentSection>
      )}
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
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #262626;
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const ChartCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }

  .ant-card-body {
    padding: 24px;
  }
`;
