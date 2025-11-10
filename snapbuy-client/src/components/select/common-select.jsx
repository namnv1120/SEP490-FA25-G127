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
      appendTo={document.body}
      panelStyle={{ zIndex: 9999 }}
      filter={filter}
      scrollHeight="250px"
    />
  );
};

export default CommonSelect;
