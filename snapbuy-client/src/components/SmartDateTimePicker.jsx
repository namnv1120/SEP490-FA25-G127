import { DatePicker } from "antd";
import { useRef, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";
import "../assets/css/datepicker-custom.css";

/**
 * Smart DateTimePicker với các tính năng:
 * 1. Tự động thêm "/" khi nhập ngày/tháng (ngay lập tức)
 * 2. Default giờ 00:00 khi nhập xong năm
 * 3. Enter hoặc click ra ngoài để đóng
 */
const SmartDateTimePicker = ({ value, onChange, placeholder, disabled, status, ...props }) => {
  const pickerRef = useRef(null);

  // Attach input event listener để tự động format
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    // Tìm input element bên trong DatePicker
    const input = picker.nativeElement?.querySelector('input');
    if (!input) return;

    const handleInput = (e) => {
      let value = e.target.value;

      // Xóa tất cả ký tự không phải số, dấu "/", dấu ":", và khoảng trắng
      const cleaned = value.replace(/[^\d/:\ ]/g, '');

      // Đếm số ký tự số (không tính dấu / : và space)
      const digitsOnly = cleaned.replace(/[^\d]/g, '');
      const length = digitsOnly.length;

      let formatted = '';

      // Format: DD/MM/YYYY HH:mm
      if (length <= 2) {
        // DD
        formatted = digitsOnly;
      } else if (length <= 4) {
        // DD/MM
        formatted = digitsOnly.substring(0, 2) + '/' + digitsOnly.substring(2);
      } else if (length <= 8) {
        // DD/MM/YYYY
        formatted = digitsOnly.substring(0, 2) + '/' +
                    digitsOnly.substring(2, 4) + '/' +
                    digitsOnly.substring(4);
      } else if (length <= 10) {
        // DD/MM/YYYY HH
        formatted = digitsOnly.substring(0, 2) + '/' +
                    digitsOnly.substring(2, 4) + '/' +
                    digitsOnly.substring(4, 8) + ' ' +
                    digitsOnly.substring(8);
      } else {
        // DD/MM/YYYY HH:mm
        formatted = digitsOnly.substring(0, 2) + '/' +
                    digitsOnly.substring(2, 4) + '/' +
                    digitsOnly.substring(4, 8) + ' ' +
                    digitsOnly.substring(8, 10) + ':' +
                    digitsOnly.substring(10, 12);
      }

      if (e.target.value !== formatted) {
        e.target.value = formatted;
        // Giữ cursor ở cuối
        e.target.setSelectionRange(formatted.length, formatted.length);
      }
    };

    input.addEventListener('input', handleInput);

    return () => {
      input.removeEventListener('input', handleInput);
    };
  }, []);

  // Parse input khi nhập xong
  const handleBlur = useCallback((e) => {
    const input = e.target;
    const value = input.value.trim();

    // Parse DD/MM/YYYY hoặc DD/MM/YYYY HH:mm
    const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;
    const match = value.match(dateTimeRegex);

    if (match) {
      const [, day, month, year, hour = '00', minute = '00'] = match;
      const parsed = dayjs(`${year}-${month}-${day} ${hour}:${minute}`, 'YYYY-MM-DD HH:mm');

      if (parsed.isValid()) {
        onChange?.(parsed);
      }
    }
  }, [onChange]);

  // Handle Enter key
  const handlePressEnter = useCallback((e) => {
    handleBlur(e);
    pickerRef.current?.blur();
  }, [handleBlur]);

  // Handle change từ calendar picker
  const handleChange = useCallback((date) => {
    if (date) {
      // Nếu chỉ chọn ngày mà không chọn giờ → set 00:00
      const hasTime = date.hour() !== 0 || date.minute() !== 0;
      if (!hasTime) {
        date = date.hour(0).minute(0).second(0);
      }
    }
    onChange?.(date);
  }, [onChange]);

  return (
    <DatePicker
      ref={pickerRef}
      showTime={{
        format: 'HH:mm',
        defaultValue: dayjs('00:00', 'HH:mm'),
      }}
      format="DD/MM/YYYY HH:mm"
      placeholder={placeholder || "Ngày/tháng/năm Giờ:Phút"}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onPressEnter={handlePressEnter}
      disabled={disabled}
      status={status}
      locale={locale}
      style={{ width: '100%' }}
      showNow={false}
      {...props}
    />
  );
};

export default SmartDateTimePicker;

