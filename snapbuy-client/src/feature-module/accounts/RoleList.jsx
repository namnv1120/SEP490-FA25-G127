import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddRole from "../../core/modals/accounts/AddRole";
import EditRole from "../../core/modals/accounts/EditRole";
import DeleteModal from "../../components/delete-modal";
import { allRoutes } from "../../routes/AllRoutes";
import TableTopHead from "../../components/table-top-head";
import Table from "../../core/pagination/datatable";

import {
  getAllRoles,
  deleteRole,
  createRole,
  updateRole,
} from "../../services/RoleService";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getAllRoles();
      const data = Array.isArray(response) ? response : response.data || response.result || [];
      setRoles(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id || selectedRole.roleId);
      fetchRoles();
    } catch (error) {
    }
  };

  const handleAddRole = async (roleData) => {
    try {
      await createRole(roleData);
      fetchRoles();
    } catch (error) {
    }
  };

  const handleUpdateRole = async (roleId, updatedData) => {
    try {
      await updateRole(roleId, updatedData);
      fetchRoles();
    } catch (error) {
    }
  };

  const columns = [
    {
      title: "Vai trò",
      dataIndex: "roleName",
      align: "left",
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      align: "left",
      sorter: (a, b) => a.createdOn.localeCompare(b.description),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      render: (isActive) => {
        const active = isActive === true || isActive === 1 || isActive === "1";
        return (
          <span
            className={`d-inline-flex align-items-center p-1 pe-2 rounded-1 text-white fs-10 ${active ? "bg-success" : "bg-danger"}`}
          >
            <i className="ti ti-point-filled me-1 fs-11"></i>
            {active ? "Hoạt động" : "Không hoạt động"}
          </span>
        );
      },
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1),
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
              to={allRoutes.permissions}
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
                <h4>Vai trò và Phân quyền</h4>
                <h6>Quản lý danh sách vai trò và quyền</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-role"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Thêm vai trò
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
                    Trạng thái
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Đang hoạt động
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ngừng hoạt động
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-4">Đang tải...</div>
                ) : (
                  <Table columns={columns} dataSource={roles} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddRole id="add-role" onCreated={handleAddRole} />
      <EditRole
        id="edit-role"
        roleId={selectedRole?.id}
        onUpdated={handleUpdateRole}
        onClose={() => setSelectedRole(null)}
      />
      <DeleteModal onConfirm={handleDeleteRole} />
    </div>
  );
};

export default RoleList;