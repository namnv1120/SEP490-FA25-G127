import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { message, Spin } from "antd";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonSelect from "../../components/select/common-select";
import CommonFooter from "../../components/footer/CommonFooter";
import AddAccountModal from "../../core/modals/accounts/AddAccountModal";
import EditAccountModal from "../../core/modals/accounts/EditAccountModal";
import {
  createStaff,
  updateStaffByOwner,
  updateStaffRolesByOwner,
  searchStaffAccountsPaged,
} from "../../services/AccountService";
import { getAllRoles } from "../../services/RoleService";

const StaffAccountList = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  const roleOptions = useMemo(
    () => availableRoles.map((r) => ({ label: r.roleName, value: r.roleName })),
    [availableRoles]
  );
  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: true, label: "Hoạt động" },
      { value: false, label: "Ngừng hoạt động" },
    ],
    []
  );

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const backendPage = Math.max(0, (currentPage || 1) - 1);
      const result = await searchStaffAccountsPaged({
        keyword: searchQuery,
        active: statusFilter,
        role: roleFilter,
        page: backendPage,
        size: rows,
        sortBy: "fullName",
        sortDir: "ASC",
      });
      const rawList = result?.content || [];
      const mapped = rawList.map((acc) => ({
        ...acc,
        active: acc.active === true || acc.active === 1 || acc.active === "1",
      }));
      setData(mapped);
      setTotalRecords(result?.totalElements || mapped.length);
    } catch (e) {
      message.error(e.message || "Không thể tải danh sách nhân viên");
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchQuery, statusFilter, roleFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getAllRoles();
        setAvailableRoles(roles);
      } catch (e) {
        message.error("Không thể tải danh sách vai trò");
      }
    };
    loadRoles();
  }, []);

  const openAddModal = () => {
    setAdding(true);
  };
  const closeAddModal = () => setAdding(false);

  const openEditModal = (acc) => {
    setEditing(acc);
    setIsEditOpen(true);
  };
  const closeEditModal = () => {
    setEditing(null);
    setIsEditOpen(false);
  };

  const toggleActive = async (acc) => {
    const id = acc.id || acc.accountId;
    try {
      await updateStaffByOwner(id, {
        active: !(
          acc.active === true ||
          acc.active === 1 ||
          acc.active === "1"
        ),
      });
      fetchStaff();
    } catch (e) {
      message.error(e.message || "Không thể đổi trạng thái");
    }
  };

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
  }, [data, currentPage]);

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
      header: "Họ và tên",
      field: "fullName",
      key: "fullName",
      sortable: true,
    },
    {
      header: "Tên đăng nhập",
      field: "username",
      key: "username",
      sortable: true,
    },
    {
      header: "Email",
      field: "email",
      key: "email",
      sortable: true,
      style: { width: "20%" },
    },
    {
      header: "Số điện thoại",
      field: "phone",
      key: "phone",
      sortable: true,
    },
    {
      header: "Vai trò",
      field: "roles",
      key: "roles",
      sortable: false,
      body: (row) => {
        const rs = Array.isArray(row.roles) ? row.roles : [];
        return rs.join(", ");
      },
    },
    {
      header: "Trạng thái",
      field: "active",
      key: "active",
      sortable: true,
      body: (row) => {
        const active =
          row.active === true || row.active === 1 || row.active === "1";
        return (
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge fw-medium fs-10 ${
                active ? "bg-success" : "bg-danger"
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
                onChange={() => toggleActive(row)}
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
      body: (row) => (
        <div className="action-table-data text-center">
          <div className="edit-delete-action d-flex justify-content-center">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                openEditModal(row);
              }}
            >
              <i data-feather="edit" className="feather-edit" />
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
            <div className="add-item d-flex justify-content-between align-items-center">
              <div className="page-title">
                <h4 className="fw-bold">Nhân viên</h4>
                <h6>Quản lý tài khoản nhân viên</h6>
              </div>
            </div>
            <TableTopHead
              showExcel={false}
              onRefresh={(e) => {
                if (e) e.preventDefault();
                fetchStaff();
                message.success("Đã làm mới danh sách nhân viên!");
              }}
            />
            <div className="page-btn">
              <button
                type="button"
                className="btn btn-primary"
                onClick={openAddModal}
              >
                <i className="ti ti-circle-plus me-1" />
                Thêm nhân viên
              </button>
            </div>
          </div>

          {/* Bộ lọc */}
          <div className="card mb-3 shadow-sm">
            <div className="card-body p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentPage(1);
                  fetchStaff();
                }}
                className="row g-3 align-items-end"
              >
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label fw-semibold text-dark mb-1">
                    Vai trò
                  </label>
                  <CommonSelect
                    options={[{ value: "", label: "Tất cả" }, ...roleOptions]}
                    value={
                      [{ value: "", label: "Tất cả" }, ...roleOptions].find(
                        (o) => o.value === (roleFilter || "")
                      ) || { value: "", label: "Tất cả" }
                    }
                    onChange={(s) => {
                      setRoleFilter(s?.value || "");
                      setCurrentPage(1);
                    }}
                    placeholder="Chọn vai trò"
                    className="w-100"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-3 ms-auto">
                  <label className="form-label fw-semibold text-dark mb-1">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Họ tên, tên đăng nhập, email, số điện thoại..."
                    value={searchQuery || ""}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Bảng */}
          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách nhân viên{" "}
                <span className="text-muted small">
                  ({totalRecords} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <div style={{ minWidth: "220px" }}>
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
                    data={data}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="id"
                    loading={loading}
                    serverSidePagination={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      <AddAccountModal
        isOpen={adding}
        onClose={closeAddModal}
        onSuccess={() => {
          fetchStaff();
        }}
        availableRoles={availableRoles}
        onCreate={(newAccount) => createStaff(newAccount)}
      />

      <EditAccountModal
        isOpen={isEditOpen}
        accountId={editing?.id || editing?.accountId}
        onClose={closeEditModal}
        onSuccess={() => {
          fetchStaff();
        }}
        onUpdated={() => {
          fetchStaff();
        }}
        availableRoles={availableRoles}
        onUpdate={(id, general) => updateStaffByOwner(id, general)}
        onUpdateRole={(id, roles) => updateStaffRolesByOwner(id, roles)}
      />
    </div>
  );
};

export default StaffAccountList;
