import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaUsers,
  FaUserCheck,
  FaBan,
  FaChevronDown,
  FaChevronRight,
  FaStore,
} from "react-icons/fa";
import { message } from "antd";
import {
  searchAdminAccounts,
  deleteAdminAccount,
  toggleAccountStatus,
  updateAdminAccount,
} from "../../services/AdminAccountService";
import ToggleStatusModal from "../components/modals/ToggleStatusModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import EditAccountModal from "../components/modals/EditAccountModal";
import "../styles/admin.css";

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [expandedStores, setExpandedStores] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [togglingAccount, setTogglingAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await searchAdminAccounts({});
      const mappedAccounts = (data || []).map((account) => ({
        id: account.accountId,
        tenantId: account.tenantId,
        username: account.username || "N/A",
        name: account.fullName || "N/A",
        email: account.email || "N/A",
        phone: account.phone || "N/A",
        role: account.roleName || "N/A",
        store: account.tenantName || "Hệ Thống",
        status: account.active ? "Hoạt Động" : "Tạm Ngưng",
        isActive: account.active,
      }));
      setAccounts(mappedAccounts);

      // Auto-expand all stores on first load
      const stores = {};
      mappedAccounts.forEach((acc) => {
        stores[acc.store] = false; // Start collapsed
      });
      setExpandedStores(stores);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      message.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.store.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || account.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      account.status.toLowerCase().includes(filterStatus.toLowerCase());

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Group accounts by store
  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    const store = account.store;
    if (!groups[store]) {
      groups[store] = [];
    }
    groups[store].push(account);
    return groups;
  }, {});

  const toggleStore = (storeName) => {
    setExpandedStores((prev) => ({
      ...prev,
      [storeName]: !prev[storeName],
    }));
  };

  const handleToggleStatus = (account) => {
    setTogglingAccount(account);
    setShowToggleModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!togglingAccount) return;

    try {
      setLoading(true);
      await toggleAccountStatus(togglingAccount.tenantId, togglingAccount.id);
      message.success(
        `Đã ${togglingAccount.isActive ? "vô hiệu hóa" : "kích hoạt"
        } tài khoản thành công`
      );
      fetchAccounts();
      setShowToggleModal(false);
      setTogglingAccount(null);
    } catch (error) {
      console.error("Error toggling status:", error);
      message.error("Không thể thay đổi trạng thái tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (account) => {
    setDeletingAccount(account);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingAccount) return;

    try {
      setLoading(true);
      await deleteAdminAccount(deletingAccount.tenantId, deletingAccount.id);
      message.success("Xóa tài khoản thành công");
      fetchAccounts();
      setShowDeleteModal(false);
      setDeletingAccount(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      message.error("Không thể xóa tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowEditModal(true);
  };

  const handleUpdateAccount = async (formData) => {
    if (!editingAccount) return;

    try {
      setLoading(true);
      await updateAdminAccount(
        editingAccount.tenantId,
        editingAccount.id,
        formData
      );
      message.success("Cập nhật tài khoản thành công");
      fetchAccounts();
      setShowEditModal(false);
      setEditingAccount(null);
    } catch (error) {
      console.error("Error updating account:", error);
      message.error("Không thể cập nhật tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const uniqueRoles = [...new Set(accounts.map((a) => a.role))];

  return (
    <div className="admin-page admin-fade-in">
      {/* Stats */}
      <div className="admin-stats-grid admin-mb-3">
        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Tổng Tài Khoản</span>
            <div className="admin-stats-icon primary">
              <FaUsers />
            </div>
          </div>
          <div className="admin-stats-value">{accounts.length}</div>
        </div>

        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Hoạt Động</span>
            <div className="admin-stats-icon success">
              <FaUserCheck />
            </div>
          </div>
          <div className="admin-stats-value">
            {accounts.filter((a) => a.status === "Hoạt Động").length}
          </div>
        </div>

        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Tạm Ngưng</span>
            <div className="admin-stats-icon danger">
              <FaBan />
            </div>
          </div>
          <div className="admin-stats-value">
            {accounts.filter((a) => a.status === "Tạm Ngưng").length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-card admin-mb-3">
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--admin-text-muted)",
              }}
            />
            <input
              type="text"
              className="admin-form-input"
              placeholder="Tìm kiếm theo tên, email hoặc cửa hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <FaFilter style={{ color: "var(--admin-text-muted)" }} />

            <select
              className="admin-form-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "auto", minWidth: "150px" }}
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="hoạt động">Hoạt Động</option>
              <option value="tạm ngưng">Tạm Ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            Tất Cả Tài Khoản ({filteredAccounts.length})
          </h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thông Tin Người Dùng</th>
                <th>Liên Hệ</th>
                <th>Vai Trò</th>
                <th>Cửa Hàng</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedAccounts).map(
                ([storeName, storeAccounts]) => {
                  // Find owner account (Chủ Cửa Hàng)
                  const ownerAccount = storeAccounts.find(
                    (acc) => acc.role === "Chủ Cửa Hàng"
                  );
                  // Get employee accounts (not owner)
                  const employeeAccounts = storeAccounts.filter(
                    (acc) => acc.role !== "Chủ Cửa Hàng"
                  );

                  return (
                    <React.Fragment key={storeName}>
                      {/* Owner Account Header Row */}
                      <tr
                        style={{
                          background: "var(--admin-bg-secondary)",
                          cursor:
                            employeeAccounts.length > 0 ? "pointer" : "default",
                          borderTop: "2px solid var(--admin-border-color)",
                        }}
                        onClick={() =>
                          employeeAccounts.length > 0 && toggleStore(storeName)
                        }
                      >
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            {employeeAccounts.length > 0 &&
                              (expandedStores[storeName] ? (
                                <FaChevronDown />
                              ) : (
                                <FaChevronRight />
                              ))}
                            <strong>{ownerAccount?.name || storeName}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.875rem" }}>
                            <div style={{ color: "var(--admin-text-primary)" }}>
                              {ownerAccount?.email || "N/A"}
                            </div>
                            <div
                              style={{
                                color: "var(--admin-text-muted)",
                                fontSize: "0.75rem",
                                marginTop: "0.25rem",
                              }}
                            >
                              {ownerAccount?.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge success">
                            {ownerAccount?.role || "Chủ Cửa Hàng"}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <FaStore
                              style={{ color: "var(--admin-primary)" }}
                            />
                            {storeName}
                            {employeeAccounts.length > 0 && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--admin-text-muted)",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                ({employeeAccounts.length} nhân viên)
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {ownerAccount && (
                            <span
                              className={`admin-badge ${ownerAccount.status === "Hoạt Động"
                                  ? "success"
                                  : "danger"
                                }`}
                            >
                              {ownerAccount.status}
                            </span>
                          )}
                        </td>
                        <td>
                          {ownerAccount && (
                            <div className="admin-action-btns">
                              <button
                                className={`admin-btn-icon ${ownerAccount.isActive ? "warning" : "success"
                                  }`}
                                title={
                                  ownerAccount.isActive
                                    ? "Vô hiệu hóa"
                                    : "Kích hoạt"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(ownerAccount);
                                }}
                              >
                                {ownerAccount.isActive ? (
                                  <FaBan />
                                ) : (
                                  <FaUserCheck />
                                )}
                              </button>
                              <button
                                className="admin-btn-icon edit"
                                title="Sửa Tài Khoản"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(ownerAccount);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="admin-btn-icon delete"
                                title="Xóa Tài Khoản"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(ownerAccount);
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Employee Rows (only if expanded and has employees) */}
                      {expandedStores[storeName] &&
                        employeeAccounts.map((account) => (
                          <tr
                            key={account.id}
                            style={{ background: "var(--admin-bg-primary)" }}
                          >
                            <td style={{ paddingLeft: "3rem" }}>
                              <strong>{account.name}</strong>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.875rem" }}>
                                <div
                                  style={{ color: "var(--admin-text-primary)" }}
                                >
                                  {account.email}
                                </div>
                                <div
                                  style={{
                                    color: "var(--admin-text-muted)",
                                    fontSize: "0.75rem",
                                    marginTop: "0.25rem",
                                  }}
                                >
                                  {account.phone}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="admin-badge info">
                                {account.role}
                              </span>
                            </td>
                            <td>{account.store}</td>
                            <td>
                              <span
                                className={`admin-badge ${account.status === "Hoạt Động"
                                    ? "success"
                                    : "danger"
                                  }`}
                              >
                                {account.status}
                              </span>
                            </td>
                            <td>
                              <div className="admin-action-btns">
                                <button
                                  className={`admin-btn-icon ${account.isActive ? "warning" : "success"
                                    }`}
                                  title={
                                    account.isActive
                                      ? "Vô hiệu hóa"
                                      : "Kích hoạt"
                                  }
                                  onClick={() => handleToggleStatus(account)}
                                >
                                  {account.isActive ? (
                                    <FaBan />
                                  ) : (
                                    <FaUserCheck />
                                  )}
                                </button>
                                <button
                                  className="admin-btn-icon edit"
                                  title="Sửa Tài Khoản"
                                  onClick={() => handleEdit(account)}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="admin-btn-icon delete"
                                  title="Xóa Tài Khoản"
                                  onClick={() => handleDelete(account)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--admin-text-muted)",
            }}
          >
            <FaUsers
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
            />
            <p>Không tìm thấy tài khoản</p>
          </div>
        )}
      </div>

      <EditAccountModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}
        onSubmit={handleUpdateAccount}
        accountData={editingAccount}
        loading={loading}
      />

      <ToggleStatusModal
        show={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={confirmToggleStatus}
        itemName={togglingAccount?.name}
        isActive={togglingAccount?.isActive}
        loading={loading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingAccount?.name}
        loading={loading}
      />
    </div>
  );
};

export default AccountManagement;
