import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AddRole from "../../core/modals/accounts/AddRoleModal";
import EditRole from "../../core/modals/accounts/EditRoleModal";
import DeleteModal from "../../components/delete-modal";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";

import {
  getAllRoles,
  deleteRole,
  createRole,
  toggleRoleStatus,
} from "../../services/RoleService";
import { message } from "antd";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // Giống như Account, gọi getAllRoles không cần tham số, trả về tất cả roles
      const response = await getAllRoles();
      const data = Array.isArray(response) ? response : response.data || response.result || [];
      const mappedData = data.map((role) => ({
        ...role,
        active: role.active === true || role.active === 1,
      }));
      setRoles(mappedData);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await toggleRoleStatus(role.id);
      await fetchRoles();
      message.success("Đã cập nhật trạng thái vai trò thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái vai trò:", err);
      message.error(err.response?.data?.message || "Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại.");
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

  const handleUpdateRole = async () => {
    try {
      await fetchRoles();
    } catch (error) {
    }
  };

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: () => (
        <label className="checkboxs">
          <input type="checkbox" />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Vai trò",
      field: "roleName",
      key: "roleName",
      sortable: true,
    },
    {
      header: "Mô tả",
      field: "description",
      key: "description",
      sortable: true,
    },
    {
      header: "Trạng thái",
      field: "active",
      key: "active",
      sortable: true,
      body: (data) => {
        const active = data.active === true || data.active === 1 || data.active === "1";
        return (
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge fw-medium fs-10 ${active ? "bg-success" : "bg-danger"}`}
            >
              {active ? "Hoạt động" : "Không hoạt động"}
            </span>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={active}
                onChange={() => handleToggleStatus(data)}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (data) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedRole(data);
                setEditModalOpen(true);
              }}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#delete-modal"
              onClick={() => setSelectedRole(data)}
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAddModalOpen(true)}
              >
                <i className="ti ti-circle-plus me-1"></i>
                Thêm vai trò
              </button>
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
                <PrimeDataTable
                  column={columns}
                  data={roles}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={roles.length}
                  dataKey="id"
                  loading={loading}
                  serverSidePagination={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddRole
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddRole}
      />
      <EditRole
        isOpen={editModalOpen}
        roleId={selectedRole?.id || selectedRole?.roleId}
        onUpdated={handleUpdateRole}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRole(null);
        }}
      />
      <DeleteModal onConfirm={handleDeleteRole} />
    </div>
  );
};

export default RoleList;