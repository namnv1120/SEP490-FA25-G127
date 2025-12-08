import React, { useState, useRef, useEffect } from 'react';
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

const CommonDateRangePicker = ({ value, onChange, className }) => {
  // Convert value từ Date objects hoặc null sang dayjs
  const getDayjsDates = () => {
    if (value && Array.isArray(value) && value[0] && value[1]) {
      return [dayjs(value[0]), dayjs(value[1])];
    }
    return [null, null];
  };

  const [dates, setDates] = useState(getDayjsDates());
  const [customVisible, setCustomVisible] = useState(false);
  const rangeRef = useRef(null);

  // Sync dates với value từ props
  useEffect(() => {
    if (value && Array.isArray(value) && value[0] && value[1]) {
      setDates([dayjs(value[0]), dayjs(value[1])]);
    } else if (!value || (Array.isArray(value) && (!value[0] || !value[1]))) {
      // Nếu null thì giữ nguyên null (không set default)
      setDates([null, null]);
    }
  }, [value]);

  const predefinedRanges = {
    'Toàn bộ': null,
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
      const newDates = predefinedRanges[key];
      if (newDates === null) {
        // "Toàn bộ" - reset về null
        setDates([null, null]);
        setCustomVisible(false);
        if (onChange) {
          onChange([null, null]);
        }
      } else {
        setDates(newDates);
        setCustomVisible(false);
        // Gọi onChange với Date objects
        if (onChange) {
          onChange([newDates[0].toDate(), newDates[1].toDate()]);
        }
      }
    }
  };

  const handleCustomChange = (value) => {
    if (value && value[0] && value[1]) {
      setDates(value);
      setCustomVisible(false);
      // Gọi onChange với Date objects
      if (onChange) {
        onChange([value[0].toDate(), value[1].toDate()]);
      }
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

  const displayValue = dates[0] && dates[1]
    ? `${dates[0].format(dateFormat)} - ${dates[1].format(dateFormat)}`
    : 'Toàn bộ thời gian';

  return (
    <div className={className} style={{ position: 'relative' }}>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
      >
        <Input
          readOnly
          value={displayValue}
          placeholder="Chọn khoảng thời gian"
        />
      </Dropdown>

      {customVisible && (
        <div style={{ position: 'absolute', zIndex: 1000, top: '100%', left: 0, marginTop: '4px' }}>
          <RangePicker
            open
            ref={rangeRef}
            onChange={handleCustomChange}
            format={dateFormat}
            value={dates}
            allowClear={false}
            onOpenChange={(open) => {
              if (!open) setCustomVisible(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CommonDateRangePicker;
