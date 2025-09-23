import { useState } from "react";
import { Table, Pagination, Select } from "antd";

const Datatable = ({ props, columns, dataSource }) => {
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  // Tính toán dữ liệu theo trang
  const startIndex = (current - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = dataSource.slice(startIndex, endIndex);

  return (
    <>
      <Table
        key={props}
        className="table datanew dataTable no-footer"
        columns={columns}
        dataSource={paginatedData}
        rowKey={(record) => record.id}
        pagination={false} // tắt pagination mặc định
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        {/* Bên trái: Row Per Page */}
        <div>
          Row Per Page{" "}
          <Select
            value={pageSize}
            onChange={(value) => {
              setPageSize(value);
              setCurrent(1);
            }}
            style={{ width: 80, margin: "0 8px" }}
            options={[
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 30, label: "30" },
            ]}
          />{" "}
          Entries
        </div>

        {/* Bên phải: Pagination */}
        <Pagination
          current={current}
          pageSize={pageSize}
          total={dataSource.length}
          onChange={(page) => setCurrent(page)}
          showSizeChanger={false} // bỏ combo mặc định của AntD
          itemRender={(page, type, originalElement) => {
            if (type === "prev") {
              return <span>{"<"}</span>;
            }
            if (type === "next") {
              return <span>{">"}</span>;
            }
            return originalElement;
          }}
        />
      </div>
    </>
  );
};

export default Datatable;