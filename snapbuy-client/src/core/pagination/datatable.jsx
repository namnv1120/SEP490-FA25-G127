import { useState } from "react";
import { Table } from "antd";

const Datatable = ({ columns, dataSource }) => {
  const [, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);

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
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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
                placeholder="Search"
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
        dataSource={filteredDataSource}
        // dùng id hoặc fallback index nếu id không có
        rowKey={(record, index) => record.id || record.userId || index}
        pagination={{
          locale: { items_per_page: "" },
          nextIcon: (
            <span>
              <i className="fa fa-angle-right" />
            </span>
          ),
          prevIcon: (
            <span>
              <i className="fa fa-angle-left" />
            </span>
          ),
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
      />
    </>
  );
};

export default Datatable;