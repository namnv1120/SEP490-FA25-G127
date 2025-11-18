import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddAccount from "../../core/modals/accounts/AddAccountModal";
import EditAccount from "../../core/modals/accounts/EditAccountModal";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import DeleteModal from "../../components/delete-modal";
import { getAllAccounts, toggleAccountStatus, deleteAccount } from "../../services/AccountService";
import { message } from "antd";
import { Modal } from "bootstrap";

const AccountList = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const accountsData = await getAllAccounts();
      const mappedData = accountsData.map((account) => ({
        ...account,
        active: account.active === true || account.active === 1,
      }));
      setDataSource(mappedData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
      if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập trang này. Chỉ Quản trị viên mới có thể truy cập.");
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        message.error(error.response?.data?.message || error.message || "Lỗi khi lấy danh sách tài khoản");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (account) => {
    try {
      await toggleAccountStatus(account.id);
      await fetchAccounts();
      message.success("Đã cập nhật trạng thái tài khoản thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái tài khoản:", err);
      message.error(err.response?.data?.message || "Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại.");
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
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 0);

      await fetchAccounts();
      message.success("Tài khoản đã được xoá thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xoá tài khoản:", err);
      message.error(err.response?.data?.message || "Lỗi khi xoá tài khoản. Vui lòng thử lại.");
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
        <div className="action-table-data text-center">
          <div className="edit-delete-action d-flex justify-content-center">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setSelectedAccount(data);
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
            <TableTopHead
            />
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
                        Hoạt động
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
                  data={dataSource}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={dataSource.length}
                  dataKey="id"
                  loading={loading}
                  serverSidePagination={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm và chỉnh sửa */}
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
          setSelectedAccount(null);
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