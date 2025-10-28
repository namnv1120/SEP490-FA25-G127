import React, { useState } from "react";
import { Link } from "react-router-dom";
import TableTopHead from "../../components/table-top-head";
import SearchFromApi from "../../components/data-table/search";
import PrimeDataTable from "../../components/data-table";
import { permissionsData } from "../../core/json/permission-data";

const Permissions = () => {
  const [listData, _setListData] = useState(permissionsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, _setTotalRecords] = useState(5);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const columns = [
    {
      header: "Modules",
      field: "module",
      key: "module",
      body: (row) => <span className="text-gray-9">{row.module}</span>,
    },
    {
      header: "Allow All",
      field: "allowAll",
      key: "allowAll",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.allowAll}
            onChange={(e) =>
              onChange && onChange(idx, "allowAll", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Read",
      field: "read",
      key: "read",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.read}
            onChange={(e) => onChange && onChange(idx, "read", e.target.checked)}
          />
        </div>
      ),
    },
    {
      header: "Write",
      field: "write",
      key: "write",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.write}
            onChange={(e) =>
              onChange && onChange(idx, "write", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Create",
      field: "create",
      key: "create",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.create}
            onChange={(e) =>
              onChange && onChange(idx, "create", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Delete",
      field: "delete",
      key: "delete",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.delete}
            onChange={(e) =>
              onChange && onChange(idx, "delete", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Import",
      field: "import",
      key: "import",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.import}
            onChange={(e) =>
              onChange && onChange(idx, "import", e.target.checked)
            }
          />
        </div>
      ),
    },
    {
      header: "Export",
      field: "export",
      key: "export",
      body: (row, idx, onChange) => (
        <div className="form-check form-check-md">
          <input
            className="form-check-input"
            type="checkbox"
            checked={row.export}
            onChange={(e) =>
              onChange && onChange(idx, "export", e.target.checked)
            }
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
            <PrimeDataTable
              column={columns}
              data={listData}
              rows={rows}
              setRows={setRows}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalRecords={totalRecords}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
