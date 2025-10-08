import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddRole from "../../core/modals/usermanagement/addrole";
import EditRole from "../../core/modals/usermanagement/editrole";
import DeleteModal from "../../components/delete-modal";
import { all_routes } from "../../routes/all_routes";

import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import Table from "../../core/pagination/datatable";

import {
  listRolesPermissions,
  deleteRolePermission,
} from "../../services/role_permissionService";

const RolesPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Load danh sách roles từ API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await listRolesPermissions();
      setRoles(response.data); // Giả định API trả về danh sách role
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Xử lý xóa role
  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await deleteRolePermission(selectedRole.id);
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  // Cột hiển thị bảng
  const columns = [
    {
      title: "Role",
      dataIndex: "roleName" || "role", // tùy theo field trong DB
      align: "center",
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: "Created On",
      dataIndex: "createdOn" || "createdon",
      align: "center",
      sorter: (a, b) => a.createdon.localeCompare(b.createdon),
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (text) => (
        <div>
          {text === "Active" && (
            <span className="d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-success fs-10">
              <i className="ti ti-point-filled me-1 fs-11"></i>
              {text}
            </span>
          )}
          {text === "Inactive" && (
            <span className="d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white bg-danger fs-10">
              <i className="ti ti-point-filled me-1 fs-11"></i>
              {text}
            </span>
          )}
        </div>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      align: "center",
      render: (record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              to={all_routes.rolespermission}
              className="me-2 d-flex align-items-center p-2 border rounded"
            >
              <i className="ti ti-shield"></i>
            </Link>
            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-role"
              onClick={() => setSelectedRole(record)}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete-modal"
              onClick={() => setSelectedRole(record)}
            >
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
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
              <RefreshIcon onClick={fetchRoles} />
              <CollapesIcon />
            </ul>
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#add-units"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Role
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set"></div>
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

            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-4">Loading...</div>
                ) : (
                  <Table columns={columns} dataSource={roles} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddRole onCreated={fetchRoles} />
      <EditRole role={selectedRole} onUpdated={fetchRoles} />
      <DeleteModal onConfirm={handleDeleteRole} />
    </div>
  );
};

export default RolesPermissions;
