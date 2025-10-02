import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Table } from "antd";
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
import DateRangePicker from "@/components/analytics/DateRangePicker";
import AnalyticsLayout from "@/components/analytics/AnalyticsLayout";

interface ProductDetailStatistics {
  date: string;
  buttonClickRates: {
    [key: string]: {
      clickRate: number;
      clicks: number;
      pageViews: number;
    };
  };
  purchaseButtonClickRate: number;
  purchaseButtonClicks: number;
  productDetailPageViews: number;
  purchaseCompletionRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  purchaseCompletions: number;
  // 링크 검색 관련 데이터 추가
  linkSearchSuccessRate: number;
  linkSearchAttempts: number;
  linkSearchSuccesses: number;
}

const ProductDetailAnalytics: React.FC = () => {
  // 퍼센트 포맷팅 함수 (백엔드에서 이미 퍼센트로 변환됨)
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // 오늘 데이터 추출 함수
  const extractTodayData = (
    trendData: any[]
  ): ProductDetailStatistics | null => {
    if (trendData.length === 0) return null;
    const lastItem = trendData[trendData.length - 1];
    return {
      date: lastItem.date,
      buttonClickRates: lastItem.buttonClickRates || {},
      purchaseButtonClickRate: lastItem.purchaseButtonClickRate || 0,
      purchaseButtonClicks: lastItem.purchaseButtonClicks || 0,
      productDetailPageViews: lastItem.productDetailPageViews || 0,
      purchaseCompletionRate: lastItem.purchaseCompletionRate || 0,
      dailyActiveUsers: lastItem.dailyActiveUsers || 0,
      weeklyActiveUsers: lastItem.weeklyActiveUsers || 0,
      monthlyActiveUsers: lastItem.monthlyActiveUsers || 0,
      purchaseCompletions: lastItem.purchaseCompletions || 0,
      // 링크 검색 관련 데이터 추가
      linkSearchSuccessRate: lastItem.linkSearchSuccessRate || 0,
      linkSearchAttempts: lastItem.linkSearchAttempts || 0,
      linkSearchSuccesses: lastItem.linkSearchSuccesses || 0,
    };
  };

  const { loading, error, todayStats, trendData, dateRange, handleDateChange } =
    useAnalyticsData({
      endpoint: "/analytics/statistics/product-detail",
      extractTodayData,
    });

  // 상품 상세 데이터 변환
  const productDetailData = trendData.map((item: any) => ({
    date: item.date,
    buttonClickRates: item.buttonClickRates || {},
    purchaseButtonClickRate: item.purchaseButtonClickRate || 0,
    purchaseButtonClicks: item.purchaseButtonClicks || 0,
    productDetailPageViews: item.productDetailPageViews || 0,
    purchaseCompletionRate: item.purchaseCompletionRate || 0,
    dailyActiveUsers: item.dailyActiveUsers || 0,
    weeklyActiveUsers: item.weeklyActiveUsers || 0,
    monthlyActiveUsers: item.monthlyActiveUsers || 0,
    purchaseCompletions: item.purchaseCompletions || 0,
    // 링크 검색 관련 데이터 추가
    linkSearchSuccessRate: item.linkSearchSuccessRate || 0,
    linkSearchAttempts: item.linkSearchAttempts || 0,
    linkSearchSuccesses: item.linkSearchSuccesses || 0,
  }));

  // 버튼 클릭률 테이블 컬럼
  const buttonColumns = [
    {
      title: "버튼",
      dataIndex: "button",
      key: "button",
    },
    {
      title: "클릭률",
      dataIndex: "clickRate",
      key: "clickRate",
      render: (value: number) => formatPercentage(value),
    },
    {
      title: "클릭 수",
      dataIndex: "clicks",
      key: "clicks",
    },
    {
      title: "페이지 조회수",
      dataIndex: "pageViews",
      key: "pageViews",
    },
  ];

  // 버튼 데이터 변환
  const getButtonTableData = () => {
    if (!todayStats?.buttonClickRates) return [];

    return Object.entries(todayStats.buttonClickRates).map(
      ([button, data]: [string, any]) => ({
        key: button,
        button,
        clickRate: data.clickRate,
        clicks: data.clicks,
        pageViews: data.pageViews,
      })
    );
  };

  return (
    <AnalyticsLayout
      selectedKey="productDetail"
      title="상품 상세 & 링크 검색 통계"
      loading={loading}
      error={error}
    >
      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onDateChange={handleDateChange}
      />

      {todayStats && (
        <>
          {/* 주요 지표 카드들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="구매 버튼 클릭률"
                  value={todayStats.purchaseButtonClickRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="상품 상세 페이지 조회수"
                  value={todayStats.productDetailPageViews}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="구매 버튼 클릭 수"
                  value={todayStats.purchaseButtonClicks}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="구매 완료율"
                  value={todayStats.purchaseCompletionRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* 링크 검색 통계 카드들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="링크 검색 성공률"
                  value={todayStats.linkSearchSuccessRate}
                  formatter={(value) => formatPercentage(value as number)}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="링크 검색 시도 수"
                  value={todayStats.linkSearchAttempts}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="링크 검색 성공 수"
                  value={todayStats.linkSearchSuccesses}
                />
              </Card>
            </Col>
          </Row>

          {/* 일주일 추이 차트들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} lg={12}>
              <Card title="구매 버튼 클릭률 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productDetailData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="purchaseButtonClickRate"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="상품 상세 페이지 조회수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productDetailData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="productDetailPageViews" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 링크 검색 추이 차트들 */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} lg={12}>
              <Card title="링크 검색 성공률 추이 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productDetailData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatPercentage(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="linkSearchSuccessRate"
                      stroke="#52c41a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="링크 검색 시도 수 (7일)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productDetailData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="linkSearchAttempts" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 버튼별 클릭률 테이블 */}
          <Card title="버튼별 클릭률 (오늘)">
            <Table
              columns={buttonColumns}
              dataSource={getButtonTableData()}
              pagination={false}
              size="small"
            />
          </Card>
        </>
      )}
    </AnalyticsLayout>
  );
};

export default ProductDetailAnalytics;
