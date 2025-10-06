import React from "react";
import { Pagination as AntdPagination, Select } from "antd";

const { Option } = Select;

const Pagination = ({ current, pageSize, total, onChange, onShowSizeChange }) => {
  return (
    <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
      {/* Left: Hiển thị số bản ghi */}
      <div className="d-flex align-items-center">
        <span className="me-2">Row Per Pages</span>
        <Select
          value={pageSize}
          onChange={(value) => onShowSizeChange(1, value)}
          style={{ width: 80 }}
          size="small"
        >
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={30}>30</Option>
        </Select>
        <span className="ms-2">entries</span>
      </div>

      {/* Right: pagination */}
      <AntdPagination
        className="custom-pagination"
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={false}
        size="small"
        itemRender={(page, type, originalElement) => {
          if (type === "prev") {
            return <a className="px-2">Prev</a>;
          }
          if (type === "next") {
            return <a className="px-2">Next</a>;
          }
          return originalElement;
        }}
      />
    </div>
  );
};

export default Pagination;