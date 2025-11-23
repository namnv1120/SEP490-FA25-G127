import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import AddAccount from "../../core/modals/accounts/AddAccountModal";
import EditAccount from "../../core/modals/accounts/EditAccountModal";
import TableTopHead from "../../components/table-top-head";
import SearchFromApi from "../../components/data-table/search";
import PrimeDataTable from "../../components/data-table";
import CommonSelect from "../../components/select/common-select";
import DeleteModal from "../../components/delete-modal";
import {
  deleteAccount,
  searchAccountsPaged,
  toggleAccountStatus,
} from "../../services/AccountService";
import { getAllRoles } from "../../services/RoleService";
import { message } from "antd";
import { Modal } from "bootstrap";

const AccountList = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // true=Hoạt động, false=Không hoạt động, null=Tất cả
  const [roleFilter, setRoleFilter] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: true, label: "Hoạt động" },
      { value: false, label: "Ngừng hoạt động" },
    ],
    []
  );

  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await getAllRoles();
        const opts = (roles || [])
          .filter((r) => r && (r.active === true || r.active === 1))
          .map((r) => ({ label: r.roleName, value: r.roleName }));
        setRoleOptions(opts);
      } catch {
        void 0;
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  const fetchAccounts = useCallback(async () => {
    try {
      const backendPage = Math.max(0, (currentPage || 1) - 1);
      const sortBy = "fullName";
      const sortDir = "ASC";
      const params = {
        keyword: searchQuery,
        active: statusFilter,
        role: roleFilter,
        page: backendPage,
        size: rows,
        sortBy,
        sortDir,
      };
      const result = await searchAccountsPaged(params);
      const rawList = result?.content || result || [];
      const mappedData = (rawList || []).map((account) => ({
        ...account,
        active:
          account.active === true ||
          account.active === 1 ||
          account.active === "1",
      }));
      setDataSource(mappedData);
      setTotalRecords(result?.totalElements ?? mappedData.length);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
      if (error.response?.status === 403) {
        message.error(
          "Bạn không có quyền truy cập trang này. Chỉ Quản trị viên mới có thể truy cập."
        );
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        message.error(
          error.response?.data?.message ||
            error.message ||
            "Lỗi khi lấy danh sách tài khoản"
        );
      }
    } finally {
      void 0;
    }
  }, [currentPage, rows, searchQuery, statusFilter, roleFilter]);

  const handleToggleStatus = async (account) => {
    try {
      await toggleAccountStatus(account.id);
      await fetchAccounts();
      message.success("Đã cập nhật trạng thái tài khoản thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái tài khoản:", err);
      message.error(
        err.response?.data?.message ||
          "Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại."
      );
    }
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      } else {
        console.error("❌ Không tìm thấy phần tử modal xoá.");
      }
    }, 0);
  };

  const handleDeleteConfirm = async (accountId) => {
    try {
      await deleteAccount(accountId);

      const modalElement = document.getElementById("delete-modal");
      const modal = Modal.getInstance(modalElement);

      if (modal) {
        modal.hide();
      }

      setTimeout(() => {
        document
          .querySelectorAll(".modal-backdrop")
          .forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 0);

      await fetchAccounts();
      message.success("Tài khoản đã được xoá thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xoá tài khoản:", err);
      message.error(
        err.response?.data?.message ||
          "Lỗi khi xoá tài khoản. Vui lòng thử lại."
      );
    } finally {
      setAccountToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setAccountToDelete(null);
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
        <div className="action-table-data text-center">
          <div className="edit-delete-action d-flex justify-content-center">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedAccountId(data.id);
                setEditModalOpen(true);
              }}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteClick(data);
              }}
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
                <h4>Tài khoản</h4>
                <h6>Quản lý danh sách tài khoản</h6>
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
                Thêm tài khoản
              </button>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set">
                <SearchFromApi
                  callback={(value) => {
                    setSearchQuery(value || "");
                  }}
                />
              </div>
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-2">
                  <CommonSelect
                    options={StatusOptions}
                    value={
                      StatusOptions.find((o) => o.value === statusFilter) ||
                      StatusOptions[0]
                    }
                    onChange={(s) => {
                      const v = s?.value;
                      setStatusFilter(v === true || v === false ? v : null);
                    }}
                    placeholder="Trạng thái"
                    width={220}
                    className=""
                  />
                </div>
                <div>
                  <CommonSelect
                    options={[{ value: "", label: "Tất cả" }, ...roleOptions]}
                    value={
                      [{ value: "", label: "Tất cả" }, ...roleOptions].find(
                        (o) => o.value === (roleFilter || "")
                      ) || { value: "", label: "Tất cả" }
                    }
                    onChange={(s) => {
                      setRoleFilter(s?.value || "");
                    }}
                    placeholder="Vai trò"
                    width={220}
                    className=""
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
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
                  serverSidePagination={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddAccount
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchAccounts}
      />
      <EditAccount
        isOpen={editModalOpen}
        accountId={selectedAccountId}
        onUpdated={fetchAccounts}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAccountId(null);
        }}
      />

      <DeleteModal
        itemId={accountToDelete?.id}
        itemName={accountToDelete?.fullName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default AccountList;
