import PrimeDataTable from "../../components/data-table";
import DeleteModal from "../../components/delete-modal";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/CommonFooter";
import CommonSelect from "../../components/select/common-select";
import { useState, useEffect, useMemo } from "react";
import {
  getAllSuppliers,
  deleteSupplier,
  toggleSupplierStatus,
} from "../../services/SupplierService";
import { message, Spin } from "antd";
import { exportToExcel } from "../../utils/excelUtils";
import { removeVietnameseTones } from "../../utils/stringUtils";

import AddSupplier from "../../core/modals/people/AddSupplierModal";
import EditSupplier from "../../core/modals/people/EditSupplierModal";
import SupplierDetailModal from "../../core/modals/people/SupplierDetailModal";

const Suppliers = () => {
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [_totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: "Hoạt động", label: "Hoạt động" },
      { value: "Không hoạt động", label: "Không hoạt động" },
    ],
    []
  );

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSuppliers();

      // Đảm bảo data là array trước khi map
      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        setListData([]);
        setTotalRecords(0);
        message.warning("Dữ liệu trả về không đúng định dạng");
        return;
      }

      const mappedData = data.map((supplier) => ({
        ...supplier,
        status:
          supplier.active === true || supplier.active === 1
            ? "Hoạt động"
            : "Không hoạt động",
        active: supplier.active === true || supplier.active === 1,
      }));
      setListData(mappedData);
      setTotalRecords(mappedData.length);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Lỗi khi tải danh sách nhà cung cấp. Vui lòng thử lại.");
      message.error("Lỗi khi tải danh sách nhà cung cấp. Vui lòng thử lại.");
      setListData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!listData || listData.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = listData.map((row) => ({
      Mã: row.supplierCode,
      "Nhà cung cấp": row.supplierName,
      "Số điện thoại": row.phone,
      Email: row.email,
      "Quận, phường": row.ward,
      Tỉnh: row.city,
      "Địa chỉ": row.address,
    }));

    try {
      await exportToExcel(exportData, "Danh sách nhà cung cấp");
    } catch {
      message.error("Lỗi khi xuất file Excel!");
    }
  };

  const filteredList = listData.filter((item) => {
    // Filter theo search query
    if (searchQuery) {
      const normalizedSearch = removeVietnameseTones(
        searchQuery.trim().toLowerCase()
      );
      const matchesSearch =
        removeVietnameseTones(item.supplierName?.toLowerCase() || "").includes(
          normalizedSearch
        ) ||
        removeVietnameseTones(item.supplierCode?.toLowerCase() || "").includes(
          normalizedSearch
        ) ||
        removeVietnameseTones(item.phone?.toLowerCase() || "").includes(
          normalizedSearch
        ) ||
        removeVietnameseTones(item.email?.toLowerCase() || "").includes(
          normalizedSearch
        );
      if (!matchesSearch) return false;
    }

    // Filter theo trạng thái
    if (statusFilter) {
      if (item.status !== statusFilter) return false;
    }

    return true;
  });

  const handleEditClick = (supplier) => {
    setEditSupplierId(supplier.supplierId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (supplierId) => {
    try {
      await deleteSupplier(supplierId);
      await fetchSuppliers();
      message.success("Xoá nhà cung cấp thành công!");
      setDeleteModalOpen(false);
      setSelectedSupplier(null);
    } catch {
      message.error("Lỗi khi xoá nhà cung cấp. Vui lòng thử lại.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleToggleStatus = async (supplier) => {
    try {
      await toggleSupplierStatus(supplier.supplierId);
      await fetchSuppliers();
      message.success("Đã cập nhật trạng thái nhà cung cấp thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái nhà cung cấp:", err);
      message.error("Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại.");
    }
  };

  const columns = [
    {
      header: "",
      body: (data) => (
        <div
          className="d-flex align-items-center justify-content-center"
          title={data.active ? "Đang hoạt động" : "Không hoạt động"}
        >
          {data.active ? (
            <i
              className="ti ti-circle-check-filled"
              style={{ fontSize: "18px", color: "#28a745" }}
            />
          ) : (
            <i
              className="ti ti-circle-x-filled"
              style={{ fontSize: "18px", color: "#dc3545" }}
            />
          )}
        </div>
      ),
      sortable: false,
      key: "statusIcon",
      style: { width: "50px", textAlign: "center" },
    },
    { header: "Mã", field: "supplierCode", key: "supplierCode" },
    {
      header: "Nhà cung cấp",
      field: "supplierName",
      key: "supplierName",
      body: (data) => (
        <button
          type="button"
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => {
            setSelectedSupplierId(data.supplierId);
            setDetailModalOpen(true);
          }}
          style={{ cursor: "pointer" }}
        >
          {data.supplierName}
        </button>
      ),
    },
    { header: "Email", field: "email", key: "email" },
    { header: "Số điện thoại", field: "phone", key: "phone" },
    { header: "Địa chỉ", field: "address", key: "address" },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge fw-medium fs-10 ${
              data.status === "Hoạt động" ? "bg-success" : "bg-danger"
            }`}
          >
            {data.status}
          </span>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={data.active}
              onChange={() => handleToggleStatus(data)}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action">
          <button
            className="me-2 p-2 border-0 bg-transparent"
            onClick={() => handleEditClick(row)}
          >
            <i className="feather icon-edit"></i>
          </button>
          {/* <button
            className="p-2 border-0 bg-transparent"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="feather icon-trash-2"></i>
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Nhà cung cấp</h4>
                <h6>Quản lý danh sách nhà cung cấp</h6>
              </div>
            </div>
            <TableTopHead
              showExcel={true}
              onExportExcel={handleExportExcel}
              onRefresh={(e) => {
                if (e) e.preventDefault();
                fetchSuppliers();
                message.success("Đã làm mới danh sách nhà cung cấp!");
              }}
            />
            <div className="page-btn">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAddModalOpen(true)}
              >
                <i className="ti ti-circle-plus me-1" />
                Thêm nhà cung cấp
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách nhà cung cấp{" "}
                <span className="text-muted small">
                  ({filteredList.length} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <div style={{ minWidth: "250px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên, mã, số điện thoại, email..."
                    value={searchQuery}
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
                      setStatusFilter(v || null);
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
                    data={filteredList}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={filteredList.length}
                    dataKey="supplierId"
                    loading={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      <AddSupplier
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchSuppliers}
      />

      {editSupplierId && (
        <EditSupplier
          isOpen={editModalOpen}
          supplierId={editSupplierId}
          onSuccess={() => {
            fetchSuppliers();
            setEditSupplierId(null);
            setEditModalOpen(false);
          }}
          onClose={() => {
            setEditSupplierId(null);
            setEditModalOpen(false);
          }}
        />
      )}
      <DeleteModal
        open={deleteModalOpen}
        itemId={selectedSupplier?.supplierId}
        itemName={selectedSupplier?.supplierName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <SupplierDetailModal
        isOpen={detailModalOpen}
        supplierId={selectedSupplierId}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedSupplierId(null);
        }}
      />
    </>
  );
};

export default Suppliers;
