import { useRef, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";
import "../../assets/css/datepicker-custom.css";

const CustomDateTimePicker = ({
  value,
  onChange,
  placeholder,
  disabled,
  status,
}) => {
  const inputRef = useRef(null);

  // Format input tự động thêm /
  const formatInput = (val) => {
    const numbers = val.replace(/\D/g, "");
    let formatted = "";

    if (numbers.length >= 1) {
      formatted = numbers.substring(0, 2);
    }
    if (numbers.length >= 3) {
      formatted += "/" + numbers.substring(2, 4);
    }
    if (numbers.length >= 5) {
      formatted += "/" + numbers.substring(4, 8);
    }
    if (numbers.length >= 9) {
      formatted += " " + numbers.substring(8, 10);
    }
    if (numbers.length >= 11) {
      formatted += ":" + numbers.substring(10, 12);
    }

    return formatted;
  };

  // Parse input thành date
  const parseInput = (val) => {
    const numbers = val.replace(/\D/g, "");

    if (numbers.length >= 8) {
      const day = numbers.substring(0, 2);
      const month = numbers.substring(2, 4);
      const year = numbers.substring(4, 8);
      const hour = numbers.length >= 10 ? numbers.substring(8, 10) : "00";
      const minute = numbers.length >= 12 ? numbers.substring(10, 12) : "00";

      const dateStr = `${day}/${month}/${year} ${hour}:${minute}`;
      const parsed = dayjs(dateStr, "DD/MM/YYYY HH:mm");

      if (parsed.isValid()) {
        return parsed;
      }
    }

    return null;
  };

  // Intercept input events
  useEffect(() => {
    const input = inputRef.current?.querySelector("input");
    if (!input) return;

    const handleInput = (e) => {
      const cursorPos = e.target.selectionStart;
      const oldValue = e.target.value;
      const formatted = formatInput(oldValue);

      if (formatted !== oldValue) {
        e.target.value = formatted;

        // Restore cursor position
        const newCursorPos = cursorPos + (formatted.length - oldValue.length);
        e.target.setSelectionRange(newCursorPos, newCursorPos);
      }

      // Parse và update nếu hợp lệ
      const parsed = parseInput(formatted);
      if (parsed) {
        onChange(parsed);
      }
    };

    input.addEventListener("input", handleInput);
    return () => input.removeEventListener("input", handleInput);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DatePicker
      ref={inputRef}
      showTime={{
        format: "HH:mm",
        defaultValue: dayjs("00:00", "HH:mm"),
      }}
      format="DD/MM/YYYY HH:mm"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      status={status}
      locale={locale}
      style={{ width: "100%" }}
      inputReadOnly={false}
      allowClear
    />
  );
};

export default CustomDateTimePicker;
