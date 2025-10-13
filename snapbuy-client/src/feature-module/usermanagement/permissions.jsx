import { useState } from "react";
import TableTopHead from "../../components/table-top-head";
import SearchFromApi from "../../components/data-table/search";
import Datatable from "../../components/data-table";
import { permissionsData } from "../../core/json/permission-data";

const Permissions = () => {
  const [listData, setListData] = useState(permissionsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, _setTotalRecords] = useState(5);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);
  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  const columns = [
    {
      title: "Modules",
      dataIndex: "module",
      key: "module",
      render: (text) => <span className="text-gray-9">{text}</span>,
    },
    {
      title: "Allow All",
      dataIndex: "allowAll",
      key: "allowAll",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx].allowAll = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Read",
      dataIndex: "read",
      key: "read",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx].read = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Write",
      dataIndex: "write",
      key: "write",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx].write = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Create",
      dataIndex: "create",
      key: "create",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx].create = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Delete",
      dataIndex: "delete",
      key: "delete",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx]["delete"] = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Import",
      dataIndex: "import",
      key: "import",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx]["import"] = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: "Export",
      dataIndex: "export",
      key: "export",
      render: (text, row) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={text}
            onChange={(e) => {
              const newListData = [...listData];
              const dataIdx = listData.findIndex(r => r.module === row.module);
              if (dataIdx !== -1) {
                newListData[dataIdx]["export"] = e.target.checked;
                setListData(newListData);
              }
            }}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Permission</h4>
              <h6>Manage your permissions</h6>
            </div>
          </div>
          <TableTopHead />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="table-top mb-0">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex align-items-center">
                <p className="mb-0 fw-medium text-gray-9 me-1">Role:</p>
                <p>Admin</p>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <Datatable
              columns={columns}
              dataSource={listData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;