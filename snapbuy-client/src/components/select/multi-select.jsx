import React from "react";
import { MultiSelect } from "primereact/multiselect";

const MultiSelectProps = ({
  value,
  options,
  placeholder = "Select",
  onChange,
}) => {

  return (
    <MultiSelect
      value={value}
      onChange={onChange}
      options={Array.isArray(options) ? options : []}
      placeholder={placeholder}
      maxSelectedLabels={3}
    />
  );
};

export default MultiSelectProps;
