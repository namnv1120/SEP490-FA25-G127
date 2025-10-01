import React from "react";
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
  console.log("values", value);

  return (
    <Dropdown
      value={value}
      options={Array.isArray(options) ? options : []}
      onChange={(e) => onChange(e)}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      appendTo="self"
      filter={filter}
    />
  );
};

export default CommonSelect;
