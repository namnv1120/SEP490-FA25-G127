import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import DeleteModal from "../../components/delete-modal";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/commonFooter";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllSuppliers, deleteSupplier } from "../../services/SupplierService";
import { message } from "antd";
import { Modal } from "bootstrap";
import { exportToExcel } from "../../utils/excelUtils";

import AddSupplier from "./AddSupplier";
import EditSupplier from "./EditSupplier";

const Suppliers = () => {
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editSupplierId, setEditSupplierId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSuppliers();
      setListData(data);
      setTotalRecords(data.length);
    } catch (err) {
      console.error("Lỗi khi tải danh sách nhà cung cấp:", err);
      setError("Lỗi khi tải danh sách nhà cung cấp. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!listData || listData.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = listData.map(row => ({
      Mã: row.supplierCode,
      "Nhà cung cấp": row.supplierName,
      "Số điện thoại": row.phone,
      Email: row.email,
      "Quận, phường": row.ward,
      Tỉnh: row.city,
      "Địa chỉ": row.address,

    }));

    exportToExcel(exportData, "Danh sách nhà cung cấp");
  };

  const handleRefresh = () => {
    fetchSuppliers();
    message.success("Supplier list refreshed!");
  }

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleEditClick = (supplier) => {
    setEditSupplierId(supplier.supplierId);
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplier(supplier);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }, 0);
  };

  const handleDeleteConfirm = async (supplierId) => {
    try {
      await deleteSupplier(supplierId);

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

      await fetchSuppliers();
      message.success("Xoá nhà cung cấp thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xoá nhà cung cấp:", err);
      message.error("Lỗi khi xoá nhà cung cấp. Vui lòng thử lại.");
    } finally {
      setSelectedSupplier(null);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedSupplier(null);
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
    { header: "Mã", field: "supplierCode", key: "supplierCode" },
    {
      header: "Nhà cung cấp",
      field: "supplierName",
      key: "supplierName",
      body: (data) => (
        <div className="d-flex align-items-center">
          <div className="ms-2">
            <p className="text-gray-9 mb-0">
              <Link to="#">{data.supplierName}</Link>
            </p>
          </div>
        </div>
      ),
    },
    { header: "Email", field: "email", key: "email" },
    { header: "Số điện thoại", field: "phone", key: "phone" },
    { header: "Quận/Phường", field: "ward", key: "ward" },
    { header: "Thành phố", field: "city", key: "city" },
    { header: "Địa chỉ", field: "address", key: "address" },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action">
          <Link className="me-2 p-2" to="#">
            <i className="feather icon-eye"></i>
          </Link>
          <button
            className="me-2 p-2 border-0 bg-transparent"
            onClick={() => handleEditClick(row)}
          >
            <i className="feather icon-edit"></i>
          </button>
          <button
            className="p-2 border-0 bg-transparent"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="feather icon-trash-2"></i>
          </button>
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
                <h4>Suppliers</h4>
                <h6>Manage your suppliers</h6>
              </div>
            </div>
            <TableTopHead
              onExportExcel={handleExportExcel}
              onRefresh={handleRefresh}
            />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-supplier"
              >
                <i className="ti ti-circle-plus me-1" />
                Thêm nhà cung cấp
              </Link>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {!loading && (
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <PrimeDataTable
                    column={columns}
                    data={listData}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="supplierId"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <CommonFooter />
      </div>

      {/* ✅ Add Supplier Component */}
      <AddSupplier onSuccess={fetchSuppliers} />

      {/* ✅ Edit Supplier Component */}
      {editSupplierId && (
        <EditSupplier
          supplierId={editSupplierId}
          onSuccess={() => {
            fetchSuppliers();
            setEditSupplierId(null);
          }}
          onClose={() => setEditSupplierId(null)}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        itemId={selectedSupplier?.supplierId}
        itemName={selectedSupplier?.supplierName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default Suppliers;
