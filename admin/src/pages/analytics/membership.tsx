import React from "react";
import { Card, Row, Col, Statistic, Segmented } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsLayout from "@/components/analytics/AnalyticsLayout";
import { useAnalyticsDate } from "@/contexts/AnalyticsDateContext";
import client from "@/utils/axios";

interface MembershipStatistics {
  date: string;
  membershipSubscribeClickRate: number;
  membershipPageViews: number;
  membershipSubscribeClicks: number;
  membershipPaymentSuccessRate: number;
  membershipSuccessfulPurchases: number;
  membershipPaymentErrorRate: number;
  membershipPaymentAbandonmentRate: number;
  membershipPurchaseFailures: number;
  membershipUnsubscribeRate: number;
  membershipUnsubscribes: number;
  membershipUserRatio: number;
  totalUsers: number;
  membershipUsers: number;
  repeatMembershipUserRatio: number;
  repeatMembershipUsers: number;
  membershipRetentionRate: number;
  currentMonthRenewalUsers: number;
  previousMonthPurchases: number;
}

const MembershipAnalytics: React.FC = () => {
  // 퍼센트 포맷팅 함수 (백엔드에서 이미 퍼센트로 변환됨)
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 오늘 데이터 추출 함수
  const extractTodayData = (
    trendData: MembershipStatistics[]
  ): MembershipStatistics | null => {
    if (trendData.length === 0) return null;
    return trendData[trendData.length - 1];
  };

  const { loading, error, todayStats, trendData } = useAnalyticsData({
    endpoint: "/analytics/statistics/membership",
    extractTodayData,
  });

  // 새 요약 지표: 재구매/해지/보류 및 개편 유지율
  const { dateRange } = useAnalyticsDate();
  const [windowDays, setWindowDays] = React.useState<number>(30);
  const [summaryLoading, setSummaryLoading] = React.useState<boolean>(false);
  const [summary, setSummary] = React.useState<{
    renewedUsers: number;
    churnedUsers: number;
    pendingUsers: number;
    renewalRate: number;
    churnRate: number;
    retentionUsers: number;
    retentionRate: number;
    purchasersInWindow: number;
  } | null>(null);

  const fetchSummary = React.useCallback(async () => {
    try {
      setSummaryLoading(true);
      const { startDate, endDate } = dateRange;
      const { data } = await client.get("/analytics/statistics/membership", {
        params: {
          startDate,
          endDate,
          windowDays,
        },
      });
      if (data?.success !== false) {
        setSummary(data.summary);
      }
    } finally {
      setSummaryLoading(false);
    }
  }, [dateRange, windowDays]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <AnalyticsLayout
      selectedKey="membership"
      title="멤버십 통계"
      loading={loading}
      error={error}
    >
      {todayStats && (
        <>
          {/* 1행: 전체 사용자 수, 멤버십 사용자 수, 멤버십 사용자 비율, 멤버십 유지율 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="전체 사용자 수"
                  value={todayStats.totalUsers}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="멤버십 사용자 수"
                  value={todayStats.membershipUsers}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="멤버십 사용자 비율"
                  value={todayStats.membershipUserRatio}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="멤버십 유지율"
                  value={todayStats.membershipRetentionRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 2행: 구독 클릭률, 결제 성공률, 결제 오류율, 결제 중단율, 성공적인 구매 수 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card>
                <Statistic
                  title="구독 클릭률"
                  value={todayStats.membershipSubscribeClickRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card>
                <Statistic
                  title="결제 성공률"
                  value={todayStats.membershipPaymentSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card>
                <Statistic
                  title="결제 오류율"
                  value={todayStats.membershipPaymentErrorRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card>
                <Statistic
                  title="결제 중단율"
                  value={todayStats.membershipPaymentAbandonmentRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Card>
                <Statistic
                  title="성공적인 구매 수"
                  value={todayStats.membershipSuccessfulPurchases}
                />
              </Card>
            </Col>
          </Row>

          {/* 재구매/해지 요약 (기간 만료자 기준, X일 윈도우) */}
          <Row gutter={[16, 16]} style={{ marginBottom: "8px" }}>
            <Col span={24}>
              <Segmented
                options={[
                  { label: "X=7일", value: 7 },
                  { label: "X=30일", value: 30 },
                  { label: "X=60일", value: 60 },
                ]}
                value={windowDays}
                onChange={(v) => setWindowDays(v as number)}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card loading={summaryLoading}>
                <Statistic
                  title="재구매 사용자 수"
                  value={summary?.renewedUsers ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={summaryLoading}>
                <Statistic
                  title="해지 사용자 수"
                  value={summary?.churnedUsers ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={summaryLoading}>
                <Statistic
                  title="재구매율"
                  value={(summary?.renewalRate ?? 0) * 100}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={summaryLoading}>
                <Statistic
                  title="해지율"
                  value={(summary?.churnRate ?? 0) * 100}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>
          {/* 판단 보류 사용자 수/율 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={12}>
              <Card loading={summaryLoading}>
                <Statistic
                  title="판단 보류 사용자 수"
                  value={summary?.pendingUsers ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Card loading={summaryLoading}>
                <Statistic
                  title="판단 보류율"
                  value={(() => {
                    const total =
                      (summary?.renewedUsers ?? 0) +
                      (summary?.churnedUsers ?? 0) +
                      (summary?.pendingUsers ?? 0);
                    return total > 0
                      ? ((summary?.pendingUsers ?? 0) / total) * 100
                      : 0;
                  })()}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 기존 '구독 해지율' 카드는 제거됨 */}

          {/* 일주일 추이 차트들 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="멤버십 사용자 비율 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="membershipUserRatio"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="결제 성공률 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="membershipPaymentSuccessRate"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="멤버십 사용자 수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="membershipUsers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="성공적인 구매 수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="membershipSuccessfulPurchases"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AnalyticsLayout>
  );
};

export default MembershipAnalytics;
