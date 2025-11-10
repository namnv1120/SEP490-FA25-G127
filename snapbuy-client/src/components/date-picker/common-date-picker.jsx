import { Calendar } from "primereact/calendar";
import { addLocale } from "primereact/api";
import { useRef, useEffect } from "react";

// Cấu hình locale tiếng Việt cho PrimeReact
const vietnameseLocale = {
  firstDayOfWeek: 1,
  dayNames: [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  monthNames: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ],
  monthNamesShort: [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ],
  today: "Hôm nay",
  clear: "Xóa",
};

// Thêm locale tiếng Việt
addLocale("vi", vietnameseLocale);

const CommonDatePicker = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  dateFormat,
  className = "",
  disabled = false,
  maxDate,
  minDate,
  appendTo = "",
}) => {
  const inputRef = useRef(null);

  // Sử dụng format mặc định nếu không được truyền vào
  // Nếu dateFormat là "dd/mm/yyyy", dùng "dd/mm/yy" để tránh bug năm lặp
  const finalDateFormat = dateFormat === "dd/mm/yyyy" ? "dd/mm/yy" : (dateFormat || "dd/mm/yy");
  const useMask = dateFormat === "dd/mm/yyyy";

  // Fix năm bị lặp khi dùng format yyyy
  useEffect(() => {
    if (!useMask || !inputRef.current) return;

    const input = inputRef.current.querySelector('input');
    if (!input) return;

    const fixYear = () => {
      if (!input.value) return;
      // Pattern: tìm năm 4 chữ số bị lặp (ví dụ: 20252025 -> 2025)
      const yearPattern = /(\d{2}\/\d{2}\/)(\d{4})\2/;
      if (yearPattern.test(input.value)) {
        input.value = input.value.replace(yearPattern, '$1$2');
      }
    };

    fixYear();
    input.addEventListener('input', fixYear);
    input.addEventListener('blur', fixYear);

    return () => {
      input.removeEventListener('input', fixYear);
      input.removeEventListener('blur', fixYear);
    };
  }, [value, useMask]);

  return (
    <div ref={inputRef}>
      <Calendar
        value={value}
        onChange={(e) => onChange(e.value)}
        placeholder={placeholder}
        dateFormat={finalDateFormat}
        className={className}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        appendTo={appendTo}
        showIcon={false}
        inputStyle={{ width: "100%" }}
        mask={useMask ? "99/99/9999" : undefined}
      />
    </div>
  );
};

const CommonMonthPicker = ({
  value,
  onChange,
  placeholder = "Chọn tháng",
  className = "",
  disabled = false,
}) => {
  return (
    <Calendar
      value={value}
      onChange={(e) => onChange(e.value)}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      dateFormat="mm/yy"
      view="month"
      yearNavigator
      yearRange="2020:2030"
    />
  );
};

export default CommonDatePicker;
export { CommonMonthPicker };
