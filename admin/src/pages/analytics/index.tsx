import React from "react";
import { Card, Row, Col, Statistic, Button, message } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsLayout from "@/components/analytics/AnalyticsLayout";
import client from "@/utils/axios";

interface StatisticsData {
  user: any;
  home: any;
  search: any;
  linkSearch: any;
  productDetail: any;
  membership: any;
  managerQA: any;
}

interface TrendData {
  period: string;
  data: StatisticsData;
}

const AnalyticsIndex: React.FC = () => {
  // 퍼센트 포맷팅 함수 (백엔드에서 이미 퍼센트로 변환됨)
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 선택한 기간의 전체 합산 데이터 추출 함수
  const extractTodayData = (trendData: TrendData[]): StatisticsData | null => {
    if (trendData.length === 0) return null;

    // 각 섹션별로 합산
    const aggregated = trendData.reduce(
      (acc, item) => {
        const data = item.data || {};

        // User 통계 합산
        if (data.user) {
          acc.user.signupPageViews += data.user.signupPageViews || 0;
          acc.user.signupCompletions += data.user.signupCompletions || 0;
          acc.user.loginAttempts += data.user.loginAttempts || 0;
          acc.user.loginSuccesses += data.user.loginSuccesses || 0;
        }

        // Home 통계 합산
        if (data.home) {
          acc.home.homePageViews += data.home.homePageViews || 0;
          acc.home.recommendedProductClicks +=
            data.home.recommendedProductClicks || 0;
        }

        // Search 통계 합산
        if (data.search) {
          acc.search.searchAttempts += data.search.searchAttempts || 0;
          acc.search.searchSuccesses += data.search.searchSuccesses || 0;
        }

        // LinkSearch 통계 합산
        if (data.linkSearch) {
          acc.linkSearch.linkSearchAttempts +=
            data.linkSearch.linkSearchAttempts || 0;
          acc.linkSearch.linkSearchSuccesses +=
            data.linkSearch.linkSearchSuccesses || 0;
        }

        // ProductDetail 통계 합산
        if (data.productDetail) {
          acc.productDetail.productDetailPageViews +=
            data.productDetail.productDetailPageViews || 0;
          acc.productDetail.purchaseButtonClicks +=
            data.productDetail.purchaseButtonClicks || 0;
        }

        // Membership 통계 합산
        if (data.membership) {
          acc.membership.totalUsers += data.membership.totalUsers || 0;
          acc.membership.membershipUsers +=
            data.membership.membershipUsers || 0;
        }

        // ManagerQA 통계 합산
        if (data.managerQA) {
          acc.managerQA.managerResponses +=
            data.managerQA.managerResponses || 0;
          acc.managerQA.responseConfirmationPageViews +=
            data.managerQA.responseConfirmationPageViews || 0;
        }

        return acc;
      },
      {
        user: {
          signupPageViews: 0,
          signupCompletions: 0,
          loginAttempts: 0,
          loginSuccesses: 0,
        },
        home: {
          homePageViews: 0,
          recommendedProductClicks: 0,
        },
        search: {
          searchAttempts: 0,
          searchSuccesses: 0,
        },
        linkSearch: {
          linkSearchAttempts: 0,
          linkSearchSuccesses: 0,
        },
        productDetail: {
          productDetailPageViews: 0,
          purchaseButtonClicks: 0,
        },
        membership: {
          totalUsers: 0,
          membershipUsers: 0,
        },
        managerQA: {
          managerResponses: 0,
          responseConfirmationPageViews: 0,
        },
      } as any
    );

    // 비율 값들은 합산된 값으로 계산
    return {
      user: {
        signupConversionRate:
          aggregated.user.signupPageViews > 0
            ? (aggregated.user.signupCompletions /
                aggregated.user.signupPageViews) *
              100
            : 0,
        loginSuccessRate:
          aggregated.user.loginAttempts > 0
            ? (aggregated.user.loginSuccesses / aggregated.user.loginAttempts) *
              100
            : 0,
      },
      home: {
        recommendedProductClickRate:
          aggregated.home.homePageViews > 0
            ? (aggregated.home.recommendedProductClicks /
                aggregated.home.homePageViews) *
              100
            : 0,
      },
      search: {
        searchSuccessRate:
          aggregated.search.searchAttempts > 0
            ? (aggregated.search.searchSuccesses /
                aggregated.search.searchAttempts) *
              100
            : 0,
      },
      linkSearch: {
        linkSearchSuccessRate:
          aggregated.linkSearch.linkSearchAttempts > 0
            ? (aggregated.linkSearch.linkSearchSuccesses /
                aggregated.linkSearch.linkSearchAttempts) *
              100
            : 0,
      },
      productDetail: {
        purchaseButtonClickRate:
          aggregated.productDetail.productDetailPageViews > 0
            ? (aggregated.productDetail.purchaseButtonClicks /
                aggregated.productDetail.productDetailPageViews) *
              100
            : 0,
        productDetailPageViews: aggregated.productDetail.productDetailPageViews,
      },
      membership: {
        membershipUserRatio:
          aggregated.membership.totalUsers > 0
            ? (aggregated.membership.membershipUsers /
                aggregated.membership.totalUsers) *
              100
            : 0,
      },
      managerQA: {
        managerResponseConfirmationRate:
          aggregated.managerQA.managerResponses > 0
            ? (aggregated.managerQA.responseConfirmationPageViews /
                aggregated.managerQA.managerResponses) *
              100
            : 0,
      },
    };
  };

  const { loading, error, todayStats, trendData } = useAnalyticsData({
    endpoint: "/analytics/statistics",
    extractTodayData,
  });

  const clearCacheAndReload = async () => {
    try {
      if (!trendData || trendData.length === 0) {
        message.warning("삭제할 캐시의 기간 데이터를 찾을 수 없어요.");
        return;
      }
      const startDate = trendData[0].period;
      const endDate = trendData[trendData.length - 1].period;

      const resp = await client.post(
        `/analytics/statistics/cache/clear?startDate=${startDate}&endDate=${endDate}`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      if (resp.status !== 200) throw new Error("캐시 삭제 실패");
      message.success("캐시를 삭제했어요. 새로고침합니다.");
      setTimeout(() => window.location.reload(), 300);
    } catch (e) {
      message.error("캐시 삭제 중 오류가 발생했어요.");
    }
  };

  return (
    <AnalyticsLayout
      selectedKey="overview"
      title="전체 통계 대시보드"
      loading={loading}
      error={error}
    >
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={clearCacheAndReload}>캐시 삭제 후 새로고침</Button>
      </div>
      {todayStats && (
        <>
          {/* 주요 지표 카드들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="회원가입 전환율"
                  value={todayStats.user?.signupConversionRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="로그인 성공률"
                  value={todayStats.user?.loginSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="검색 성공률"
                  value={todayStats.search?.searchSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="멤버십 사용자 비율"
                  value={todayStats.membership?.membershipUserRatio}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 추가 지표 카드들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="링크 검색 성공률"
                  value={todayStats.linkSearch?.linkSearchSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="구매 버튼 클릭률"
                  value={todayStats.productDetail?.purchaseButtonClickRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="상품 상세 페이지 조회수"
                  value={todayStats.productDetail?.productDetailPageViews}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="홈 추천 상품 클릭률"
                  value={todayStats.home?.recommendedProductClickRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 일주일 추이 차트들 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="회원가입 전환율 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="data.user.signupConversionRate"
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
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="data.user.loginSuccessRate"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="검색 성공률 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="data.search.searchSuccessRate"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="멤버십 사용자 비율 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="data.membership.membershipUserRatio"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="링크 검색 성공률 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="data.linkSearch.linkSearchSuccessRate"
                      stroke="#52c41a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="구매 버튼 클릭률 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="data.productDetail.purchaseButtonClickRate"
                      stroke="#722ed1"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AnalyticsLayout>
  );
};

export default AnalyticsIndex;
