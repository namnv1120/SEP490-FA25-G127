/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/CommonFooter";
import CommonSelect from "../../components/select/common-select";
import { getAllInventories } from "../../services/InventoryService";
import { message, Spin } from "antd";
import EditInventory from "../../core/modals/inventories/EditInventoryModal";
import ProductDetailModal from "../../core/modals/inventories/ProductDetailModal";
import { removeVietnameseTones } from "../../utils/stringUtils";

const InventoryList = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: "Thiếu hàng", label: "Thiếu hàng" },
      { value: "Cần đặt hàng", label: "Cần đặt hàng" },
      { value: "Quá tồn", label: "Quá tồn" },
      { value: "Ổn định", label: "Ổn định" },
    ],
    []
  );

  const openEditModal = (row) => {
    setSelectedInventory(row);
    setModalVisible(true);
  };

  const closeEditModal = () => {
    setModalVisible(false);
    setSelectedInventory(null);
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllInventories();

      const mapped = data
        .filter((item) => item && item.inventoryId != null)
        .map((item) => ({
          inventoryId: item.inventoryId,
          productCode: item.productCode || "Không có",
          productId: item.productId || "Không có",
          productName: item.productName || "Không có",
          quantityInStock: item.quantityInStock ?? 0,
          minimumStock: item.minimumStock ?? 0,
          maximumStock: item.maximumStock ?? 0,
          reorderPoint: item.reorderPoint ?? 0,
          lastUpdated: item.lastUpdated || null,
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

  const getItemStatus = (item) => {
    const qty = Number(item.quantityInStock);
    const min = Number(item.minimumStock);
    const max = Number(item.maximumStock);
    const reorder = Number(item.reorderPoint);

    if (qty < min) return "Thiếu hàng";
    if (qty < reorder) return "Cần đặt hàng";
    if (qty > max) return "Quá tồn";
    return "Ổn định";
  };

  const filteredList = inventoryList.filter((item) => {
    // Filter theo search query
    if (searchQuery) {
      const normalizedSearch = removeVietnameseTones(
        searchQuery.trim().toLowerCase()
      );
      const matchesSearch =
        removeVietnameseTones(item.productName?.toLowerCase() || "").includes(
          normalizedSearch
        ) ||
        removeVietnameseTones(
          item.productId?.toString().toLowerCase() || ""
        ).includes(normalizedSearch);
      if (!matchesSearch) return false;
    }

    // Filter theo trạng thái
    if (statusFilter) {
      const itemStatus = getItemStatus(item);
      if (itemStatus !== statusFilter) return false;
    }

    return true;
  });

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
  }, [inventoryList, currentPage]);

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
          <input type="checkbox" data-id={data.inventoryId} />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Mã sản phẩm",
      field: "productCode",
      key: "productCode",
      sortable: true,
    },
    {
      header: "Tên sản phẩm",
      field: "productName",
      key: "productName",
      sortable: true,
      body: (data) => (
        <button
          type="button"
          className="btn btn-link p-0 text-primary text-decoration-none"
          onClick={() => {
            setSelectedProductId(data.productId);
            setDetailModalOpen(true);
          }}
          style={{ cursor: "pointer" }}
        >
          {data.productName}
        </button>
      ),
    },
    { header: "Tồn kho", field: "quantityInStock" },
    { header: "Tồn kho tối thiểu", field: "minimumStock" },
    { header: "Tồn kho tối đa", field: "maximumStock" },
    { header: "Điểm đặt hàng lại", field: "reorderPoint" },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      body: (rowData) => {
        const status = getItemStatus(rowData);
        switch (status) {
          case "Thiếu hàng":
            return <span className="badge bg-danger">Thiếu hàng</span>;
          case "Cần đặt hàng":
            return (
              <span className="badge bg-warning text-dark">Cần đặt hàng</span>
            );
          case "Quá tồn":
            return <span className="badge bg-warning text-dark">Quá tồn</span>;
          case "Ổn định":
            return <span className="badge bg-success">Ổn định</span>;
          default:
            return <span className="badge bg-secondary">—</span>;
        }
      },
    },
    // {
    //   header: "Ngày cập nhật",
    //   body: (rowData) =>
    //     rowData.lastUpdated
    //       ? new Date(rowData.lastUpdated).toLocaleDateString("vi-VN")
    //       : "-",
    // },
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

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Quản lý tồn kho</h4>
              <h6>Theo dõi lượng hàng, cảnh báo thiếu hoặc quá tồn</h6>
            </div>
          </div>
          <TableTopHead
            showExcel={false}
            onRefresh={(e) => {
              if (e) e.preventDefault();
              fetchInventories();
              message.success("Đã làm mới danh sách tồn kho!");
            }}
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách tồn kho{" "}
              <span className="text-muted small">
                ({filteredList.length} bản ghi)
              </span>
            </h5>
            <div className="d-flex gap-2 align-items-end flex-wrap">
              <div style={{ minWidth: "250px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên sản phẩm, mã sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                    // Hiệu ứng loading ngắn khi tìm kiếm (đồng bộ với Account/Role/Product)
                    setLoading(true);
                    setTimeout(() => setLoading(false), 200);
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
                    // Hiệu ứng loading ngắn khi đổi trạng thái lọc
                    setLoading(true);
                    setTimeout(() => setLoading(false), 200);
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
                  dataKey="inventoryId"
                  loading={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CommonFooter />
      <EditInventory
        visible={modalVisible}
        onClose={closeEditModal}
        inventory={selectedInventory}
        onUpdated={fetchInventories}
      />
      <ProductDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
      />
    </div>
  );
};

export default InventoryList;
