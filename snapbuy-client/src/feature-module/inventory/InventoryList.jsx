/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/commonFooter";
import CommonDatePicker from "../../components/date-picker/common-date-picker";
import SearchFromApi from "../../components/data-table/search";
import { getAllInventories } from "../../services/InventoryService";
import { message } from "antd";
import EditInventory from "../inventory/EditInventory";


const InventoryList = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openEditModal = (row) => {
    setSelectedInventory(row);
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setSelectedInventory(null);
  };

  // ✅ Lấy dữ liệu tồn kho từ backend
  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllInventories();

      // 🔹 Chuẩn hóa dữ liệu để tránh lỗi undefined
      const mapped = data.map((item, index) => ({
        inventoryId: item.inventoryId || item.id || index + 1,
        productId: item.productId || item.product?.productId || "Không có",
        productName: item.productName || item.product?.productName || "Không có",
        quantityInStock: item.quantityInStock ?? item.quantity ?? 0,
        minimumStock: item.minimumStock ?? 0,
        maximumStock: item.maximumStock ?? 0,
        reorderPoint: item.reorderPoint ?? 0,
        lastUpdated: item.lastUpdated || item.updatedAt || null,
      }));

      setInventoryList(mapped);
      setTotalRecords(mapped.length);
    } catch (error) {
      setError("Không thể tải dữ liệu tồn kho. Vui lòng thử lại.");
      message.error("Không thể tải dữ liệu tồn kho. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lọc danh sách theo ô tìm kiếm
  const filteredList = inventoryList.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productId?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ✅ Cấu hình cột bảng
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
    { header: "Tên sản phẩm", field: "productName" },
    { header: "Tồn kho hiện tại", field: "quantityInStock" },
    { header: "Tồn kho tối thiểu", field: "minimumStock" },
    { header: "Tồn kho tối đa", field: "maximumStock" },
    { header: "Điểm đặt hàng lại", field: "reorderPoint" },
    {
      header: "Trạng thái",
      body: (rowData) => {
        const qty = Number(rowData.quantityInStock);
        const min = Number(rowData.minimumStock);
        const max = Number(rowData.maximumStock);

        if (qty < min) return <span className="badge bg-danger">Thiếu hàng</span>;
        if (qty > max) return <span className="badge bg-warning text-dark">Quá tồn</span>;
        return <span className="badge bg-success">Ổn định</span>;
      },
    },
    {
      header: "Ngày cập nhật",
      body: (rowData) =>
        rowData.lastUpdated
          ? new Date(rowData.lastUpdated).toLocaleDateString("vi-VN")
          : "-",
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <button
            className="me-2 p-2 border rounded bg-transparent"
            onClick={() => openEditModal(row)}
          >
            <i className="feather icon-edit"></i>
          </button>
        </div>
      ),
    },

  ];

  // ✅ Xử lý tìm kiếm
  const handleSearch = (value) => setSearchQuery(value);

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* 🔹 Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Quản lý tồn kho</h4>
              <h6>Theo dõi lượng hàng, cảnh báo thiếu hoặc quá tồn</h6>
            </div>
          </div>
          <TableTopHead onRefresh={fetchInventories} />
        </div>

        {/* 🔹 Thông báo lỗi */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* 🔹 Loading */}
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        )}

        {/* 🔹 Danh sách tồn kho */}
        {!loading && (
          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <CommonDatePicker value={dateFilter} onChange={setDateFilter} />
              </div>
            </div>

            <div className="card-body">
              <div className="table-responsive">
                <PrimeDataTable
                  column={columns}
                  data={filteredList}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={filteredList.length}
                  loading={loading}
                  dataKey="inventoryId"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <CommonFooter />
      <EditInventory
        visible={modalVisible}
        onClose={closeEditModal}
        inventory={selectedInventory}
        onUpdated={fetchInventories}
      />

    </div>
  );
};

export default InventoryList;
