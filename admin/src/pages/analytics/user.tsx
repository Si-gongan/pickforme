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

interface UserStatistics {
  date: string;
  signupConversionRate: number;
  signupPageViews: number;
  signupCompletions: number;
  loginSuccessRate: number;
  loginFailureRate: number;
  loginAttempts: number;
  loginSuccesses: number;
  loginFailures: number;
  socialLoginStats: {
    google: number;
    apple: number;
    kakao: number;
  };
  ttfa: {
    averageTime: number;
    medianTime: number;
  };
  firstVisitorConversionRate: number;
  firstVisitors: number;
  firstVisitorDetailViews: number;
}

const UserAnalytics: React.FC = () => {
  // 퍼센트 포맷팅 함수 (백엔드에서 이미 퍼센트로 변환됨)
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 선택한 기간의 전체 합산 데이터 추출 함수
  const extractTodayData = (
    trendData: UserStatistics[]
  ): UserStatistics | null => {
    if (trendData.length === 0) return null;

    // 전체 기간 합산
    const aggregated = trendData.reduce(
      (acc, curr) => {
        // 숫자 값들은 합산
        acc.signupPageViews += curr.signupPageViews || 0;
        acc.signupCompletions += curr.signupCompletions || 0;
        acc.loginAttempts += curr.loginAttempts || 0;
        acc.loginSuccesses += curr.loginSuccesses || 0;
        acc.loginFailures += curr.loginFailures || 0;
        acc.firstVisitors += curr.firstVisitors || 0;
        acc.firstVisitorDetailViews += curr.firstVisitorDetailViews || 0;
        acc.socialLoginStats.google += curr.socialLoginStats?.google || 0;
        acc.socialLoginStats.apple += curr.socialLoginStats?.apple || 0;
        acc.socialLoginStats.kakao += curr.socialLoginStats?.kakao || 0;

        // TTFA는 평균 계산을 위해 합산
        acc.ttfaSum += curr.ttfa?.averageTime || 0;
        acc.ttfaCount += 1;

        return acc;
      },
      {
        signupPageViews: 0,
        signupCompletions: 0,
        loginAttempts: 0,
        loginSuccesses: 0,
        loginFailures: 0,
        socialLoginStats: { google: 0, apple: 0, kakao: 0 },
        ttfaSum: 0,
        ttfaCount: 0,
        firstVisitors: 0,
        firstVisitorDetailViews: 0,
      } as any
    );

    // 비율 값들은 합산된 값으로 계산
    const signupConversionRate =
      aggregated.signupPageViews > 0
        ? (aggregated.signupCompletions / aggregated.signupPageViews) * 100
        : 0;
    const loginSuccessRate =
      aggregated.loginAttempts > 0
        ? (aggregated.loginSuccesses / aggregated.loginAttempts) * 100
        : 0;
    const loginFailureRate =
      aggregated.loginAttempts > 0
        ? (aggregated.loginFailures / aggregated.loginAttempts) * 100
        : 0;
    const firstVisitorConversionRate =
      aggregated.firstVisitors > 0
        ? (aggregated.firstVisitorDetailViews / aggregated.firstVisitors) * 100
        : 0;

    return {
      date: `${trendData[0]?.date || ""} ~ ${
        trendData[trendData.length - 1]?.date || ""
      }`,
      signupConversionRate,
      signupPageViews: aggregated.signupPageViews,
      signupCompletions: aggregated.signupCompletions,
      loginSuccessRate,
      loginFailureRate,
      loginAttempts: aggregated.loginAttempts,
      loginSuccesses: aggregated.loginSuccesses,
      loginFailures: aggregated.loginFailures,
      socialLoginStats: aggregated.socialLoginStats,
      ttfa: {
        averageTime:
          aggregated.ttfaCount > 0
            ? aggregated.ttfaSum / aggregated.ttfaCount
            : 0,
        medianTime: 0,
      },
      firstVisitorConversionRate,
      firstVisitors: aggregated.firstVisitors,
      firstVisitorDetailViews: aggregated.firstVisitorDetailViews,
    };
  };

  const { loading, error, todayStats, trendData } = useAnalyticsData({
    endpoint: "/analytics/statistics/user",
    extractTodayData,
  });

  return (
    <AnalyticsLayout
      selectedKey="user"
      title="사용자 통계"
      loading={loading}
      error={error}
    >
      {todayStats && (
        <>
          {/* 첫번째 row: 첫방문자전환율 + 평균TTFA + 회원가입페이지조회수 + 회원가입완료수 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="첫 방문자 전환율"
                  value={todayStats.firstVisitorConversionRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="평균 TTFA (초)"
                  value={todayStats.ttfa.averageTime}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="회원가입 페이지 조회수"
                  value={todayStats.signupPageViews}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="회원가입 완료 수"
                  value={todayStats.signupCompletions}
                />
              </Card>
            </Col>
          </Row>

          {/* 세번째 row: 로그인 시도수, 로그인 성공수, 로그인 성공률 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="로그인 시도 수"
                  value={todayStats.loginAttempts}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="로그인 성공 수"
                  value={todayStats.loginSuccesses}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="로그인 성공률"
                  value={todayStats.loginSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 네번째 row: 각 소셜로그인별 성공수 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="Google 로그인"
                  value={todayStats.socialLoginStats.google}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="Apple 로그인"
                  value={todayStats.socialLoginStats.apple}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <Statistic
                  title="Kakao 로그인"
                  value={todayStats.socialLoginStats.kakao}
                />
              </Card>
            </Col>
          </Row>

          {/* 일주일 추이 차트들 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="첫 방문자 전환율 추이 (7일)">
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
                      dataKey="firstVisitorConversionRate"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="로그인 성공률 추이 (7일)">
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
                      dataKey="loginSuccessRate"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="회원가입 페이지 조회수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="signupPageViews" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="회원가입 완료 수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="signupCompletions" fill="#82ca9d" />
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

export default UserAnalytics;
