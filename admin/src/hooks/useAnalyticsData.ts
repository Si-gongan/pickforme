import { useState, useEffect } from "react";
import axios from "@/utils/axios";

interface UseAnalyticsDataOptions {
  endpoint: string;
  extractTodayData?: (trendData: any[]) => any;
}

export const useAnalyticsData = ({
  endpoint,
  extractTodayData,
}: UseAnalyticsDataOptions) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  // 기본 날짜 범위 계산
  const getDefaultDateRange = () => {
    const today = new Date();
    // analytics가 일일 통계를 조회하므로 어제 날짜를 기준으로 계산
    today.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 2);

    return {
      endDate: today.toISOString().split("T")[0],
      startDate: weekAgo.toISOString().split("T")[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // 데이터 로드
  const loadData = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(endpoint, {
        params: { startDate, endDate },
      });
      console.log("🚀 ~ loadData ~ response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setTrendData(data);

        // 오늘 데이터 추출
        if (extractTodayData) {
          const todayData = extractTodayData(data);
          setTodayStats(todayData);
        } else if (data.length > 0) {
          // 기본적으로 마지막 요소를 오늘 데이터로 사용
          setTodayStats(data[data.length - 1]);
        }
      }
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error("Analytics data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
    loadData(newStartDate, newEndDate);
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadData(dateRange.startDate, dateRange.endDate);
  }, []);

  return {
    loading,
    error,
    todayStats,
    trendData,
    dateRange,
    handleDateChange,
    reloadData: () => loadData(dateRange.startDate, dateRange.endDate),
  };
};
