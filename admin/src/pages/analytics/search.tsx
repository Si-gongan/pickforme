import React from "react";
import { Card, Row, Col, Statistic } from "antd";
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

interface SearchStatistics {
  date: string;
  searchSuccessRate: number;
  searchFailureRate: number;
  searchAttempts: number;
  searchSuccesses: number;
  searchFailures: number;
  searchRecommendationClickRate: number;
  searchResultPageViews: number;
  searchRecommendationClicks: number;
}

const SearchAnalytics: React.FC = () => {
  // 퍼센트 포맷팅 함수 (백엔드에서 이미 퍼센트로 변환됨)
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 선택한 기간의 전체 합산 데이터 추출 함수
  const extractTodayData = (
    trendData: SearchStatistics[]
  ): SearchStatistics | null => {
    if (trendData.length === 0) return null;

    // 전체 기간 합산
    const aggregated = trendData.reduce(
      (acc, curr) => {
        acc.searchAttempts += curr.searchAttempts || 0;
        acc.searchSuccesses += curr.searchSuccesses || 0;
        acc.searchFailures += curr.searchFailures || 0;
        acc.searchResultPageViews += curr.searchResultPageViews || 0;
        acc.searchRecommendationClicks += curr.searchRecommendationClicks || 0;
        return acc;
      },
      {
        searchAttempts: 0,
        searchSuccesses: 0,
        searchFailures: 0,
        searchResultPageViews: 0,
        searchRecommendationClicks: 0,
      }
    );

    // 비율 값들은 합산된 값으로 계산
    const searchSuccessRate =
      aggregated.searchAttempts > 0
        ? (aggregated.searchSuccesses / aggregated.searchAttempts) * 100
        : 0;
    const searchFailureRate =
      aggregated.searchAttempts > 0
        ? (aggregated.searchFailures / aggregated.searchAttempts) * 100
        : 0;
    const searchRecommendationClickRate =
      aggregated.searchResultPageViews > 0
        ? (aggregated.searchRecommendationClicks / aggregated.searchResultPageViews) * 100
        : 0;

    return {
      date: `${trendData[0]?.date || ""} ~ ${trendData[trendData.length - 1]?.date || ""}`,
      searchSuccessRate,
      searchFailureRate,
      searchAttempts: aggregated.searchAttempts,
      searchSuccesses: aggregated.searchSuccesses,
      searchFailures: aggregated.searchFailures,
      searchRecommendationClickRate,
      searchResultPageViews: aggregated.searchResultPageViews,
      searchRecommendationClicks: aggregated.searchRecommendationClicks,
    };
  };

  const { loading, error, todayStats, trendData } =
    useAnalyticsData({
      endpoint: "/analytics/statistics/search",
      extractTodayData,
    });

  return (
    <AnalyticsLayout
      selectedKey="search"
      title="검색 통계"
      loading={loading}
      error={error}
    >

      {todayStats && (
        <>
          {/* 주요 지표 카드들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 성공률"
                  value={todayStats.searchSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 실패률"
                  value={todayStats.searchFailureRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 추천 클릭률"
                  value={todayStats.searchRecommendationClickRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 시도 수"
                  value={todayStats.searchAttempts}
                />
              </Card>
            </Col>
          </Row>

          {/* 수치 카드들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 성공 수"
                  value={todayStats.searchSuccesses}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 실패 수"
                  value={todayStats.searchFailures}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 결과 페이지 조회수"
                  value={todayStats.searchResultPageViews}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 추천 클릭 수"
                  value={todayStats.searchRecommendationClicks}
                />
              </Card>
            </Col>
          </Row>

          {/* 일주일 추이 차트들 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="검색 성공률 추이 (7일)">
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
                      dataKey="searchSuccessRate"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="검색 실패률 추이 (7일)">
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
                      dataKey="searchFailureRate"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="검색 시도 수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="searchAttempts" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="검색 성공 수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="searchSuccesses" fill="#82ca9d" />
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

export default SearchAnalytics;
