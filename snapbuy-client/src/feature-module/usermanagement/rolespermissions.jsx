import { useState } from "react";
import { Link } from "react-router-dom";
import AddRole from "../../core/modals/usermanagement/addrole";
import EditRole from "../../core/modals/usermanagement/editrole";
import DeleteModal from "../../components/delete-modal";
import PrimeDataTable from "../../components/data-table";
import { all_routes } from "../../routes/all_routes";
import SearchFromApi from "../../components/data-table/search";

import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";

const RolesPermissions = () => {
  // Dữ liệu cứng ví dụ
  const sampleRoles = [
    {
      id: 1,
      role: "Admin",
      createdDate: "2025-09-01",
      status: "Active",
    },
    {
      id: 2,
      role: "Manager",
      createdDate: "2025-08-15",
      status: "Inactive",
    },
    {
      id: 3,
      role: "Editor",
      createdDate: "2025-07-20",
      status: "Active",
    },
    {
      id: 4,
      role: "Viewer",
      createdDate: "2025-06-10",
      status: "Active",
    },
  ];

  const [listData, setListData] = useState(sampleRoles);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(sampleRoles.length);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState();

const columns = [
  {
    key: "select",
    selectionMode: "multiple", // ✅ PrimeReact tự lo select all
    headerStyle: { width: "60px", textAlign: "center" },
    bodyStyle: { textAlign: "center" },
  },
  { 
    header: "Role", 
    field: "role", 
    key: "role", 
    className: "text-center",
    style: { width: "200px" } 
  },
  { 
    header: "Created Date", 
    field: "createdDate", 
    key: "createdDate", 
    className: "text-center",
    style: { width: "200px" } 
  },
  {
    header: "Status",
    field: "status",
    key: "status",
    className: "text-center",
    style: { width: "150px" },
    body: (row) => (
      <span
        className={`badge d-inline-flex align-items-center badge-xs ${
          row.status === "Active" ? "badge-success" : "badge-danger"
        }`}
      >
        <i className="ti ti-point-filled me-1"></i>
        {row.status}
      </span>
    ),
  },
  {
    header: " ",
    field: "actions",
    key: "actions",
    sortable: false,
    className: "text-center",
    style: { width: "150px" },
    body: (_row) => (
      <div className="action-icon d-inline-flex justify-content-center">
        <Link
          to={all_routes.rolespermission}
          className="me-2 d-flex align-items-center p-2 border rounded"
        >
          <i className="ti ti-shield"></i>
        </Link>
        <Link
          to="#"
          className="me-2 d-flex align-items-center p-2 border rounded"
          data-bs-toggle="modal"
          data-bs-target="#edit-role"
        >
          <i className="ti ti-edit"></i>
        </Link>
        <Link
          to="#"
          data-bs-toggle="modal"
          data-bs-target="#delete-modal"
          className="d-flex align-items-center p-2 border rounded"
        >
          <i className="ti ti-trash"></i>
        </Link>
      </div>
    ),
  },
];

  const handleSearch = (value) => {
    setSearchQuery(value);
    const filtered = sampleRoles.filter((item) =>
      item.role.toLowerCase().includes(value.toLowerCase())
    );
    setListData(filtered);
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Roles & Permissions</h4>
                <h6>Manage your roles</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <TooltipIcons />
              <RefreshIcon />
              <CollapesIcon />
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-units"
              >
                <i className="feather icon-plus-circle me-2" />
                Add Role
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} className="ms-3" />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown me-2">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Status
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Inactive
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
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
      </div>

      <AddRole />
      <EditRole />
      <DeleteModal />
    </>
  );
};

export default RolesPermissions;