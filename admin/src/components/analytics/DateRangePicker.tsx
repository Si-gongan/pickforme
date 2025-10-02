import React from "react";
import { DatePicker, Space, Card } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const handleDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const newStartDate = dates[0].format("YYYY-MM-DD");
      const newEndDate = dates[1].format("YYYY-MM-DD");
      onDateChange(newStartDate, newEndDate);
    }
  };

  return (
    <Card style={{ marginBottom: "24px" }}>
      <Space>
        <span>기간 선택:</span>
        <RangePicker
          value={[dayjs(startDate), dayjs(endDate)]}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          allowClear={false}
        />
      </Space>
    </Card>
  );
};

export default DateRangePicker;
