import { Dropdown } from "primereact/dropdown";

const CommonSelect = ({
  value,
  options,
  placeholder = "Chọn",
  onChange,
  className = "",
  disabled = false,
  filter = true,
  width = 220,
}) => {
  return (
    <Dropdown
      value={value?.value}
      options={Array.isArray(options) ? options : []}
      onChange={(e) => {
        const selectedOption = options.find((opt) => opt.value === e.value);
        onChange(selectedOption || null);
      }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      appendTo={document.body}
      panelStyle={{ zIndex: 9999, width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      filter={filter}
      scrollHeight="250px"
      style={{ width: `${width}px` }}
    />
  );
};

export default CommonSelect;
