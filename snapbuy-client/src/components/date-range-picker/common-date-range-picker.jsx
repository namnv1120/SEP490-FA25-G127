import React, { useState, useRef } from 'react';
import { DatePicker, Dropdown, Input } from 'antd';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);

const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';

const CommonDateRangePicker = () => {
  const [dates, setDates] = useState([
    dayjs().subtract(6, 'days'),
    dayjs(),
  ]);
  const [customVisible, setCustomVisible] = useState(false);
  const rangeRef = useRef(null);

  const predefinedRanges = {
    'Hôm nay': [dayjs(), dayjs()],
    'Hôm qua': [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
    '7 ngày qua': [dayjs().subtract(6, 'day'), dayjs()],
    '30 ngày qua': [dayjs().subtract(29, 'day'), dayjs()],
    'Tháng này': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Tháng trước': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'Tùy chọn ngày') {
      setCustomVisible(true);
      setTimeout(() => rangeRef.current?.focus(), 0);
    } else {
      setDates(predefinedRanges[key]);
      setCustomVisible(false);
    }
  };

  const handleCustomChange = (value) => {
    if (value) {
      setDates(value);
      setCustomVisible(false);
    }
  };

  const menuItems = [
    ...Object.keys(predefinedRanges).map(label => ({
      key: label,
      label,
    })),
    { type: 'divider' },
    { key: 'Tùy chọn ngày', label: 'Tùy chọn ngày' },
  ];

  const displayValue = `${dates[0].format(dateFormat)} - ${dates[1].format(dateFormat)}`;

  return (
    <div>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
      >
        <Input
          readOnly
          value={displayValue}
        />
      </Dropdown>


      {customVisible && (
        <RangePicker
          open
          ref={rangeRef}
          onChange={handleCustomChange}
          format={dateFormat}
          value={dates}
          allowClear={false}
          style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }}
          onOpenChange={(open) => {
            if (!open) setCustomVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default CommonDateRangePicker;
