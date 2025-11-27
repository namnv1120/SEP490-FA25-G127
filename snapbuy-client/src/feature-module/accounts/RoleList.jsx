import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import AddRole from "../../core/modals/accounts/AddRoleModal";
import EditRole from "../../core/modals/accounts/EditRoleModal";
import DeleteModal from "../../components/delete-modal";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";

import {
  deleteRole,
  toggleRoleStatus,
  searchRolesPaged,
} from "../../services/RoleService";
import { message, Spin } from "antd";
import CommonFooter from "../../components/footer/CommonFooter";

const RoleList = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null=Tất cả, true=Hoạt động, false=Không hoạt động

  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: true, label: "Hoạt động" },
      { value: false, label: "Không hoạt động" },
    ],
    []
  );

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const backendPage = Math.max(0, (currentPage || 1) - 1);
      const sortBy = "roleName";
      const sortDir = "ASC";
      const params = {
        keyword: searchQuery,
        active: statusFilter,
        page: backendPage,
        size: rows,
        sortBy,
        sortDir,
      };
      const result = await searchRolesPaged(params);
      const rawList = result?.content || result || [];
      const mappedData = (rawList || []).map((role) => ({
        ...role,
        active: role.active === true || role.active === 1,
      }));
      setDataSource(mappedData);
      setTotalRecords(result?.totalElements ?? mappedData.length);
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
      if (error.response?.status === 403) {
        message.error(
          "Bạn không có quyền truy cập trang này. Chỉ Quản trị viên hoặc Chủ cửa hàng mới có thể truy cập."
        );
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        message.error(
          error.response?.data?.message ||
          error.message ||
          "Lỗi khi lấy danh sách vai trò"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchQuery, statusFilter]);

  const handleToggleStatus = async (role) => {
    try {
      await toggleRoleStatus(role.id);
      await fetchRoles();
      message.success("Đã cập nhật trạng thái vai trò thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái vai trò:", err);
      message.error(
        err.response?.data?.message ||
        "Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại."
      );
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleDeleteRole = async (roleId) => {
    try {
      await deleteRole(roleId);
      await fetchRoles();
      message.success("Vai trò đã được xoá thành công!");
      setDeleteModalOpen(false);
      setSelectedRole(null);
    } catch (err) {
      console.error("❌ Lỗi khi xoá vai trò:", err);
      message.error("Lỗi khi xoá vai trò. Vui lòng thử lại.");
    }
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedRole(null);
  };

  const handleAddRole = async () => {
    try {
      await fetchRoles();
    } catch (err) {
      console.error("❌ Lỗi khi tải lại danh sách vai trò:", err);
    }
  };

  const handleUpdateRole = async () => {
    try {
      await fetchRoles();
    } catch {
      void 0;
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Reset select-all checkbox và tất cả checkbox khi chuyển trang
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all");
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
    }
    const checkboxes = document.querySelectorAll(
      '.table-list-card input[type="checkbox"][data-id]'
    );
    checkboxes.forEach((cb) => {
      cb.checked = false;
    });
  }, [currentPage]);

  // Handle select-all checkbox
  useEffect(() => {
    const selectAllCheckbox = document.getElementById("select-all");

    const handleSelectAll = (e) => {
      const checkboxes = document.querySelectorAll(
        '.table-list-card input[type="checkbox"][data-id]'
      );
      checkboxes.forEach((cb) => {
        cb.checked = e.target.checked;
      });
    };

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", handleSelectAll);
    }

    return () => {
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", handleSelectAll);
      }
    };
  }, [dataSource, currentPage]);

  const columns = [
    {
      header: (
        <label className="checkboxs">
          <input type="checkbox" id="select-all" />
          <span className="checkmarks" />
        </label>
      ),
      body: (data) => (
        <label className="checkboxs">
          <input type="checkbox" data-id={data.id} />
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
        const active =
          data.active === true || data.active === 1 || data.active === "1";
        return (
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge fw-medium fs-10 ${active ? "bg-success" : "bg-danger"
                }`}
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
            <button
              className="confirm-text p-2 border rounded bg-transparent"
              onClick={() => handleDeleteClick(data)}
            >
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </button>
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
                <h4 className="fw-bold">Vai trò và Phân quyền</h4>
                <h6>Quản lý danh sách vai trò và quyền</h6>
              </div>
            </div>
            <TableTopHead
              showExcel={false}
              onRefresh={(e) => {
                if (e) e.preventDefault();
                fetchRoles();
                message.success("Đã làm mới danh sách vai trò!");
              }}
            />
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

          {/* Bảng */}
          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách vai trò{" "}
                <span className="text-muted small">
                  ({totalRecords} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <div style={{ minWidth: "250px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên vai trò, mô tả..."
                    value={searchQuery || ""}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div style={{ minWidth: "180px" }}>
                  <CommonSelect
                    options={StatusOptions}
                    value={
                      StatusOptions.find((o) => o.value === statusFilter) ||
                      StatusOptions[0]
                    }
                    onChange={(s) => {
                      const v = s?.value;
                      setStatusFilter(v === true || v === false ? v : null);
                      setCurrentPage(1);
                    }}
                    placeholder="Chọn trạng thái"
                    className="w-100"
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                {loading ? (
                  <div className="d-flex justify-content-center p-5">
                    <Spin size="large" />
                  </div>
                ) : (
                  <PrimeDataTable
                    column={columns}
                    data={dataSource}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="id"
                    loading={false}
                    serverSidePagination={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
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
      <DeleteModal
        open={deleteModalOpen}
        itemId={selectedRole?.id || selectedRole?.roleId}
        itemName={selectedRole?.roleName}
        onDelete={handleDeleteRole}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default RoleList;
