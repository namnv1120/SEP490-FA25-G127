import { useState, useEffect } from "react";
import { Table } from "antd";
import Pagination from "./pagination";

const Datatable = ({ columns, dataSource }) => {
  const [, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource || []);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setFilteredDataSource(dataSource || []);
    setCurrent(1); 
  }, [dataSource]);

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
    setCurrent(1);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const paginatedData = filteredDataSource.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <>
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
                placeholder="Tìm kiếm"
                aria-controls="DataTables_Table_0"
              />
            </label>
          </div>
        </div>
      </div>

      <Table
        className="table datanew dataTable no-footer"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={paginatedData}
        rowKey={(record) => record.id || record.userId || String(record.username) || String(record.email)}
        pagination={false}
      />

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