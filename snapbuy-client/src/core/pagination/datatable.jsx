import { useState } from "react";
import { Table } from "antd";
import Pagination from "./pagination";

const Datatable = ({ columns, dataSource }) => {
  const [, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);

  // state pagination
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filteredData = dataSource.filter((record) =>
      Object.values(record).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredDataSource(filteredData);
    setCurrent(1); // reset về trang 1 sau khi search
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // tính data theo trang
  const paginatedData = filteredDataSource.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <>
      {/* search box */}
      <div className="search-set table-search-set">
        <div className="search-input">
          <button type="button" className="btn btn-searchset">
            <i className="ti ti-search fs-14 feather-search" />
          </button>
          <div id="DataTables_Table_0_filter" className="dataTables_filter">
            <label>
              <input
                type="search"
                onChange={(e) => handleSearch(e.target.value)}
                className="form-control form-control-sm"
                placeholder="Search"
                aria-controls="DataTables_Table_0"
              />
            </label>
          </div>
        </div>
      </div>

      {/* table */}
      <Table
        className="table datanew dataTable no-footer"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={paginatedData}
        rowKey={(record, index) => record.id || record.userId || index}
        pagination={false} // tắt pagination mặc định của antd
      />

      {/* pagination riêng */}
      <Pagination
        current={current}
        pageSize={pageSize}
        total={filteredDataSource.length}
        onChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
        onShowSizeChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
      />
    </>
  );
};

export default Datatable;
