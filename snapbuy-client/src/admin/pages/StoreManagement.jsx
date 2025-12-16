import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaStore,
  FaGlobe,
  FaDatabase,
} from "react-icons/fa";
import { message } from "antd";
import TenantService from "../../services/TenantService";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import ToggleStatusModal from "../components/modals/ToggleStatusModal";
import ConfirmModal from "../components/modals/ConfirmModal";
import AddStoreModal from "../components/modals/AddStoreModal";
import EditStoreModal from "../components/modals/EditStoreModal";
import "../styles/admin.css";

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showDemoDataModal, setShowDemoDataModal] = useState(false);
  const [deletingStore, setDeletingStore] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [togglingStore, setTogglingStore] = useState(null);
  const [demoDataStore, setDemoDataStore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await TenantService.getAllTenants();

      // Map backend data to frontend format
      const mappedStores = await Promise.all(
        (response.result || []).map(async (tenant) => {
          // Check if store has demo data
          let hasDemoData = false;
          try {
            const demoDataResponse = await TenantService.checkDemoData(
              tenant.tenantId
            );
            hasDemoData = demoDataResponse.result || false;
          } catch (error) {
            console.error("Error checking demo data:", error);
          }

          return {
            id: tenant.tenantId,
            name: tenant.storeName || tenant.tenantCode,
            domain: `${tenant.tenantCode}.snapbuy.com.vn`,
            owner: tenant.ownerName || "N/A",
            email: tenant.ownerEmail || "N/A",
            phone: tenant.ownerPhone || "N/A",
            status: tenant.isActive ? "Hoạt Động" : "Ngừng Hoạt Động",
            users: tenant.userCount || 0,
            products: tenant.productCount || 0,
            revenue: tenant.revenue || 0,
            createdAt: tenant.createdDate
              ? new Date(tenant.createdDate).toLocaleDateString("vi-VN")
              : "N/A",
            tenantCode: tenant.tenantCode,
            isActive: tenant.isActive,
            hasDemoData: hasDemoData,
          };
        })
      );

      setStores(mappedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      message.error("Không thể tải danh sách cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      store.status.toLowerCase().includes(filterStatus.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const handleToggleStatus = (store) => {
    setTogglingStore(store);
    setShowToggleModal(true);
  };

  const confirmToggleStatus = async () => {
    const newStatus = !togglingStore.isActive;
    try {
      setLoading(true);
      await TenantService.updateTenantStatus(togglingStore.id, newStatus);
      message.success(
        `${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} cửa hàng thành công`
      );
      fetchStores();
      setShowToggleModal(false);
      setTogglingStore(null);
    } catch (error) {
      console.error("Error toggling status:", error);
      message.error("Không thể thay đổi trạng thái cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (store) => {
    setDeletingStore(store);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await TenantService.deleteTenant(deletingStore.id);
      message.success("Xóa cửa hàng thành công");
      fetchStores();
      setShowDeleteModal(false);
      setDeletingStore(null);
    } catch (error) {
      console.error("Error deleting store:", error);
      message.error(error.response?.data?.message || "Không thể xóa cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setShowEditModal(true);
  };

  const handleAddStore = async (formData) => {
    try {
      setLoading(true);
      const response = await TenantService.createTenant(formData);

      if (response.code === 1000 || !response.code) {
        message.success("Tạo cửa hàng thành công");
        fetchStores();
        setShowAddModal(false);
      } else {
        const errorMessage = response.message || "Không thể tạo cửa hàng";
        message.error(errorMessage, 5);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không thể tạo cửa hàng";

      message.error(errorMessage, 5);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStore = async (formData) => {
    try {
      setLoading(true);
      await TenantService.updateTenant(editingStore.id, formData);
      message.success("Cập nhật cửa hàng thành công");
      fetchStores();
      setShowEditModal(false);
      setEditingStore(null);
    } catch (error) {
      console.error("Error updating store:", error);
      message.error(
        error.response?.data?.message || "Không thể cập nhật cửa hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoDataClick = (store) => {
    setDemoDataStore(store);
    setShowDemoDataModal(true);
  };

  const handleInsertDemoData = async () => {
    if (!demoDataStore) return;

    try {
      setLoading(true);
      const response = await TenantService.insertDemoData(demoDataStore.id);

      if (response.code === 1000 || !response.code) {
        message.success("Thêm dữ liệu mẫu thành công");
        fetchStores(); // Refresh to update hasDemoData status
        setShowDemoDataModal(false);
        setDemoDataStore(null);
      } else {
        message.error(response.message || "Không thể thêm dữ liệu mẫu");
      }
    } catch (error) {
      console.error("Error inserting demo data:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không thể thêm dữ liệu mẫu";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page admin-fade-in">
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            Đang tải...
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="admin-stats-grid admin-mb-3">
        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Tổng Số Cửa Hàng</span>
            <div className="admin-stats-icon primary">
              <FaStore />
            </div>
          </div>
          <div className="admin-stats-value">{stores.length}</div>
        </div>

        <div className="admin-stats-card">
          <div className="admin-stats-header">
            <span className="admin-stats-title">Cửa Hàng Hoạt Động</span>
            <div className="admin-stats-icon success">
              <FaGlobe />
            </div>
          </div>
          <div className="admin-stats-value">
            {stores.filter((s) => s.status === "Hoạt Động").length}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="admin-card admin-mb-3">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
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
              placeholder="Tìm kiếm cửa hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                background: "var(--admin-bg-tertiary)",
                border: "1px solid var(--admin-border-color)",
                borderRadius: "var(--admin-radius-md)",
                color: "var(--admin-text-primary)",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "0.75rem 2.5rem 0.75rem 1rem",
              background: "var(--admin-bg-tertiary)",
              border: "1px solid var(--admin-border-color)",
              borderRadius: "var(--admin-radius-md)",
              color: "var(--admin-text-primary)",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="hoạt động">Hoạt Động</option>
            <option value="ngừng">Ngừng Hoạt Động</option>
          </select>

          {/* Add Button */}
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaPlus />
            Thêm Cửa Hàng
          </button>
        </div>
      </div>

      {/* Stores Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            Tất Cả Cửa Hàng ({filteredStores.length})
          </h2>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chủ Sở Hữu</th>
                <th>Thông Tin Cửa Hàng</th>
                <th>Liên Hệ</th>
                <th>Trạng Thái</th>
                <th>Người Dùng</th>
                <th>Sản Phẩm</th>
                <th>Doanh Thu</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store) => (
                <tr key={store.id}>
                  <td>{store.owner}</td>
                  <td>
                    <div>
                      <strong
                        style={{ display: "block", marginBottom: "0.25rem" }}
                      >
                        {store.name}
                      </strong>
                      <code
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--admin-accent-primary)",
                        }}
                      >
                        {store.domain}
                      </code>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.875rem" }}>
                      <div>{store.email}</div>
                      <div
                        style={{
                          color: "var(--admin-text-muted)",
                          marginTop: "0.25rem",
                        }}
                      >
                        {store.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        store.status === "Hoạt Động"
                          ? "success"
                          : store.status === "Chờ Duyệt"
                          ? "warning"
                          : "danger"
                      }`}
                    >
                      {store.status}
                    </span>
                  </td>
                  <td>{store.users}</td>
                  <td>{store.products}</td>
                  <td>{store.revenue.toLocaleString("vi-VN")} ₫</td>
                  <td>
                    <div className="admin-action-btns">
                      <button
                        className={`admin-btn-icon ${
                          store.isActive ? "warning" : "success"
                        }`}
                        title={store.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        onClick={() => handleToggleStatus(store)}
                      >
                        <FaGlobe />
                      </button>
                      <button
                        className="admin-btn-icon edit"
                        title="Cập Nhật Cửa Hàng"
                        onClick={() => handleEdit(store)}
                      >
                        <FaEdit />
                      </button>
                      {!store.hasDemoData && (
                        <button
                          className="admin-btn-icon info"
                          title="Thêm Dữ Liệu Mẫu"
                          onClick={() => handleDemoDataClick(store)}
                        >
                          <FaDatabase />
                        </button>
                      )}
                      <button
                        className="admin-btn-icon delete"
                        title="Xóa Cửa Hàng"
                        onClick={() => handleDelete(store)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStores.length === 0 && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--admin-text-muted)",
            }}
          >
            <FaStore
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}
            />
            <p>Không tìm thấy cửa hàng</p>
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      <AddStoreModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStore}
        loading={loading}
      />

      {/* Edit Store Modal */}
      <EditStoreModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingStore(null);
        }}
        onSubmit={handleUpdateStore}
        storeData={editingStore}
        loading={loading}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingStore?.name}
        loading={loading}
      />

      <ToggleStatusModal
        show={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        onConfirm={confirmToggleStatus}
        itemName={togglingStore?.name}
        isActive={togglingStore?.isActive}
        loading={loading}
      />

      {/* Demo Data Confirmation Modal */}
      <ConfirmModal
        show={showDemoDataModal}
        onClose={() => {
          setShowDemoDataModal(false);
          setDemoDataStore(null);
        }}
        onConfirm={handleInsertDemoData}
        title="Xác nhận thêm dữ liệu mẫu"
        message={`Bạn có chắc chắn muốn thêm dữ liệu mẫu cho cửa hàng "${demoDataStore?.name}"?`}
        description="Dữ liệu mẫu bao gồm sản phẩm, danh mục và các thông tin demo khác."
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={loading}
        type="info"
      />
    </div>
  );
};

export default StoreManagement;
