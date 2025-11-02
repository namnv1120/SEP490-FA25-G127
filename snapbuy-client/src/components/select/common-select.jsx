import { Dropdown } from "primereact/dropdown";

const CommonSelect = ({
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
  disabled = false,
  filter = true,
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
      appendTo={document.body} // ✅ render menu ra ngoài body để không bị che
      panelStyle={{ zIndex: 9999 }} // ✅ đảm bảo nổi lên trên mọi thứ
      filter={filter}
      scrollHeight="250px" // ✅ nếu danh sách dài
    />
  );
};

export default CommonSelect;
