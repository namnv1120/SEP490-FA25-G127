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
        const selectedOption = options.find(opt => opt.value === e.value);
        onChange(selectedOption || null);
      }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      appendTo="self"
      filter={filter}
    />
  );
};

export default CommonSelect;
