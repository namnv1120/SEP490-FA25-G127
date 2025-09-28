import { useState } from "react";

const CustomSortHeader = ({ col }) => {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder * -1);
    } else {
      setSortField(field);
      setSortOrder(1);
    }
  };

  return (
    <>
      <div
        className="custom-sort-header d-flex"
        onClick={() => handleSort(col.field)}
      >
        {col.header}
        <img
          // src={sortIcon}
          alt="Sort Icon"
          className="ml-2"
          style={{
            transform: sortOrder === -1 ? "rotate(180deg)" : "none",
          }}
        />
      </div>
    </>
  );
};

export default CustomSortHeader;