import React, {useEffect, useState} from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import styled from '@emotion/styled';
import { getRequestsAtom, getUserStatsAtom, getRequestStatsAtom, requestsAtom, userStatsAtom, requestStatsAtom } from '@/stores/request/atoms';
import { getUsersAtom, usersAtom } from '@/stores/user/atoms';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { eachDayOfInterval, startOfToday, sub, subMonths, startOfWeek, eachWeekOfInterval, format, parseISO } from 'date-fns';

export default function DashboardScreen() {
  const requests = useAtomValue(requestsAtom);
  const users = useAtomValue(usersAtom);
  const userStats = useAtomValue(userStatsAtom); 
  const requestStats = useAtomValue(requestStatsAtom);
  const getRequests = useSetAtom(getRequestsAtom);
  const getUsers = useSetAtom(getUsersAtom);
  const getUserStats = useSetAtom(getUserStatsAtom); 
  const getRequestsStats = useSetAtom(getRequestStatsAtom);

  const today = startOfToday();
  const threeMonthsAgo = subMonths(today, 3);

  const [userStartDate, setUserStartDate] = useState(format(threeMonthsAgo, 'yyyy-MM-dd'));
  const [userEndDate, setUserEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [requestStartDate, setRequestStartDate] = useState(format(threeMonthsAgo, 'yyyy-MM-dd'));
  const [requestEndDate, setRequestEndDate] = useState(format(today, 'yyyy-MM-dd'));

  const userSignupData = calculateUserSignups(users);

  useEffect(() => {
    getRequests({});
    getUsers({});
    getUserStats();
    getRequestsStats();
  }, []);

  useEffect(() => {
    if (userStartDate < userEndDate){
      getUsers({start: userStartDate, end: userEndDate})
    } else {

    }
  }, [userStartDate, userEndDate]);

  useEffect(() => {
    if (requestStartDate < requestEndDate){
      getRequests({start: requestStartDate, end: requestEndDate})
    } else {

    }
  }, [requestStartDate, requestEndDate]);

  const statsByType = {
    AI: userStats.filter(stat => stat._id.type === 'AI'),
    RECOMMEND: userStats.filter(stat => stat._id.type === 'RECOMMEND'),
    RESEARCH: userStats.filter(stat => stat._id.type === 'RESEARCH'),
  };

  const renderStatsTable = (stats:any, title:string) => (
    <div>
      <h3>{title}</h3>
      <StyledTable>
        <thead>
          <tr>
            <th>의뢰 수</th>
            <th>유저 수</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat:any, index:number) => (
            <tr key={index}>
              <td>{stat._id.requestCount}</td>
              <td>{stat.userCount}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </div>
  );

  const graphData = aggregateRequestsByDateForAllTypes(requests);

  return (
    <Container>
      <Title>대시보드</Title>
      <Content>
        <SectionTop>
          <GraphTitle>회원가입 통계 ({users.length} 명)</GraphTitle>
          <DateRangeSelector>
            <input type="date" value={userStartDate} onChange={(e) => setUserStartDate(e.target.value)} />
            <input type="date" value={userEndDate} onChange={(e) => setUserEndDate(e.target.value)} />
          </DateRangeSelector>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userSignupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </SectionTop>
        <SectionTop>
          <GraphTitle>서비스 의뢰 수 별 유저 통계</GraphTitle>
          <StatsTablesContainer>
            {renderStatsTable(statsByType.RECOMMEND, '상품 추천')}
            {renderStatsTable(statsByType.RESEARCH, '상품 분석')}
            {renderStatsTable(statsByType.AI, 'AI 포미')}
          </StatsTablesContainer>
        </SectionTop>
        <SectionBottom>
          <GraphTitle>서비스 통계</GraphTitle>
          <div>상품 추천: {requests.filter(e => e.type === 'RECOMMEND').length }회 / 상품 분석: {requests.filter(e => e.type === 'RESEARCH').length }회</div>
          <DateRangeSelector>
            <input type="date" value={requestStartDate} onChange={(e) => setRequestStartDate(e.target.value)} />
            <input type="date" value={requestEndDate} onChange={(e) => setRequestEndDate(e.target.value)} />
          </DateRangeSelector>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekStart" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/*<Bar dataKey="AI" fill="#8884d8" />*/}
              <Bar dataKey="RECOMMEND" fill="#82ca9d" />
              <Bar dataKey="RESEARCH" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </SectionBottom>
        <SectionBottom>
          <GraphTitle>리뷰 통계</GraphTitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Type</th>
                <th>Total Reviews</th>
                <th>Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {requestStats.map((item, index) => (
                <tr key={index}>
                  <td>{item.type}</td>
                  <td>{item.totalReviews}</td>
                  <td>{item.averageRating.toFixed(2)}</td> {/* 소수점 둘째 자리까지 반올림 */}
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <ReviewTextsContainer>
            {requestStats.map((item, index) => (
              <ReviewTableContainer key={`review-${index}`}>
                <h3>{item.type}</h3>
                <StyledTable>
                  <tbody>
                    {item.reviewTexts.filter((text:string) => text.trim() !== "").map((text:string, textIndex:number) => (
                      <tr key={`text-${index}-${textIndex}`}>
                        <td>{text}</td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </ReviewTableContainer>
            ))}
          </ReviewTextsContainer>
        </SectionBottom>
      </Content>
    </Container>
  );
}

const calculateUserSignups = (users: any[]) => {
   // 사용자 데이터가 없는 경우, 기본적으로 최근 30일간의 데이터를 고려합니다.
   const startDate = users.length > 0 ? parseISO(users[0].createdAt) : sub(startOfToday(), { days: 30 });
   const endDate = startOfToday();
 
   // 각 날짜별로 카운트 초기화
   const allDates = eachDayOfInterval({ start: startDate, end: endDate });
   const countsByDate = allDates.reduce((acc: any, date) => {
     const formattedDate = format(date, 'yyyy-MM-dd');
     acc[formattedDate] = 0; // 모든 날짜에 대해 카운트를 0으로 초기화
     return acc;
   }, {});
 
   // 실제 사용자 데이터를 사용하여 카운트
   users.forEach(user => {
     const date = format(parseISO(user.createdAt), 'yyyy-MM-dd');
     if (countsByDate[date] !== undefined) {
       countsByDate[date] += 1;
     }
   });
 
   // 객체를 배열로 변환하여 반환
   return Object.entries(countsByDate).map(([date, count]) => ({
     date, count
   }));
};

const aggregateRequestsByDateForAllTypes = (requests: any[]) => {
  if (requests.length === 0) {
    return [];
  }
  const sortedRequests = requests.slice().reverse();

  // 2. 첫 번째와 마지막 날짜를 기반으로 모든 주를 찾음
  const firstDate = parseISO(sortedRequests[0].createdAt);
  const lastDate = parseISO(sortedRequests[sortedRequests.length - 1].createdAt);
  const allWeeks = eachWeekOfInterval({ start: firstDate, end: lastDate });

  // 3. 집계 및 빈 데이터 채우기
  const aggregatedData = allWeeks.reduce((acc: any, weekStart) => {
    const formattedWeekStart = format(weekStart, 'yyyy-MM-dd');
    acc[formattedWeekStart] = { weekStart: formattedWeekStart, AI: 0, RECOMMEND: 0, RESEARCH: 0 };
    return acc;
  }, {});

  // 4. 실제 데이터를 집계
  sortedRequests.forEach(request => {
    const weekStart = format(startOfWeek(parseISO(request.createdAt)), 'yyyy-MM-dd');
    if (aggregatedData[weekStart]) {
      aggregatedData[weekStart][request.type] += 1;
    }
  });

  return Object.values(aggregatedData);
};

const Container = styled.div`
  width: 100%;
  padding: 20px;
  padding-top: 50px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 30px;
  line-height: 27px;
  margin-bottom: 30px;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 20px;
`;

const SectionTop = styled.div`
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 450px;
  overflow-y: auto; /* 세로 방향으로만 내용이 넘칠 경우 스크롤바 표시 */
  margin-bottom: 20px; /* 섹션 간의 간격 조정 */
`;

const SectionBottom = styled.div`
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 450px; /* 예시로 450px의 고정 높이 설정 */
  overflow-y: auto; /* 세로 방향으로만 내용이 넘칠 경우 스크롤바 표시 */
  margin-bottom: 20px; /* 섹션 간의 간격 조정 */
`;

const GraphTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const StatsTablesContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTable = styled.table`
  width: 100%; /* 테이블 너비를 조정 */
  border-collapse: collapse; /* 테이블 보더 간격 제거 */
  margin: 10px 0;

  th, td {
    border: 1px solid #ccc; /* 테이블 셀 보더 스타일 */
    text-align: left; /* 텍스트 정렬 */
    padding: 8px; /* 셀 안쪽 여백 */
  }

  th {
    background-color: #f2f2f2; /* 테이블 헤더 배경색 */
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;

  input[type="date"] {
    max-width: 150px; // 날짜 선택기 너비 제한
    margin-left: 10px;
  }
`;

const ReviewTextsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* 필요에 따라 아이템들을 다음 줄로 자동 줄바꿈 */
  gap: 20px; /* 각 리뷰 텍스트 테이블 사이의 간격 */
`;

const ReviewTableContainer = styled.div`
  flex: 1; /* 각 테이블 컨테이너가 가능한 공간을 균등하게 차지하도록 함 */
  min-width: 250px; /* 최소 너비 설정으로 너무 작게 줄어들지 않도록 함 */
`;
