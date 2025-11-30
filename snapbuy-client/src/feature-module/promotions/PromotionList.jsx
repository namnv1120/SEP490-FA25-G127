import { useState, useEffect, useCallback } from "react";
import { message, Spin } from "antd";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/CommonFooter";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import { getAllPromotions, togglePromotionStatus, deletePromotion } from "../../services/PromotionService";
import AddPromotionModal from "../../core/modals/promotions/AddPromotionModal";
import EditPromotionModal from "../../core/modals/promotions/EditPromotionModal";
import DeleteModal from "../../components/delete-modal";

const PromotionList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState(null);
  const [startDateRange, setStartDateRange] = useState([null, null]);
  const [endDateRange, setEndDateRange] = useState([null, null]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const formatDateTime = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPromotions();

      const now = new Date();
      const mappedData = data.map((promo) => {
        const endDate = new Date(promo.endDate);
        const isExpired = endDate < now;

        // Tự động đánh dấu là không hoạt động nếu đã hết hạn
        const isActive = promo.active && !isExpired;

        return {
          promotionId: promo.promotionId,
          promotionName: promo.promotionName,
          description: promo.description || "Không có",
          discountType: promo.discountType,
          discountValue:
            promo.discountType === "Giảm theo phần trăm"
              ? `${promo.discountValue}%`
              : `${promo.discountValue?.toLocaleString()} đ`,
          discountValueRaw: promo.discountValue, // Lưu giá trị số thực tế để sort
          startDate: formatDateTime(promo.startDate),
          endDate: formatDateTime(promo.endDate),
          startDateRaw: promo.startDate, // Lưu raw date để filter
          endDateRaw: promo.endDate, // Lưu raw date để filter
          productCount: promo.productIds?.length || 0,
          status: isActive
            ? "Hoạt động"
            : isExpired
              ? "Hết hạn"
              : "Không hoạt động",
          active: isActive,
          isExpired: isExpired,
          originalActive: promo.active, // Lưu giá trị active gốc từ backend
        };
      });

      setPromotions(mappedData);
      setLoading(false);
    } catch {
      setError("Lỗi khi tải danh sách khuyến mãi. Vui lòng thử lại.");
      message.error("Không thể tải danh sách khuyến mãi");
    } finally {
      void 0;
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Áp dụng tất cả filters
  useEffect(() => {
    if (promotions.length === 0) {
      setFilteredPromotions([]);
      setTotalRecords(0);
      return;
    }

    let filtered = [...promotions];

    // Filter theo search term
    if (searchTerm?.trim()) {
      const lowerQuery = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (promo) =>
          promo.promotionName.toLowerCase().includes(lowerQuery) ||
          promo.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter theo loại giảm giá
    if (discountTypeFilter) {
      filtered = filtered.filter(
        (promo) => promo.discountType === discountTypeFilter
      );
    }

    // Filter theo thời gian bắt đầu
    if (startDateRange && Array.isArray(startDateRange) && startDateRange[0] && startDateRange[1]) {
      const fromDate = new Date(startDateRange[0]);
      fromDate.setHours(0, 0, 0, 0);
      const fromTimestamp = fromDate.getTime();

      const toDate = new Date(startDateRange[1]);
      toDate.setHours(23, 59, 59, 999);
      const toTimestamp = toDate.getTime();

      filtered = filtered.filter((promo) => {
        if (!promo.startDateRaw) return false;

        try {
          const promoStartDate = new Date(promo.startDateRaw);
          if (isNaN(promoStartDate.getTime())) return false;
          promoStartDate.setHours(0, 0, 0, 0);
          const promoStartTimestamp = promoStartDate.getTime();

          return promoStartTimestamp >= fromTimestamp && promoStartTimestamp <= toTimestamp;
        } catch (error) {
          console.error("Error filtering by start date range:", error, promo);
          return false;
        }
      });
    }

    // Filter theo thời gian kết thúc
    if (endDateRange && Array.isArray(endDateRange) && endDateRange[0] && endDateRange[1]) {
      const fromDate = new Date(endDateRange[0]);
      fromDate.setHours(0, 0, 0, 0);
      const fromTimestamp = fromDate.getTime();

      const toDate = new Date(endDateRange[1]);
      toDate.setHours(23, 59, 59, 999);
      const toTimestamp = toDate.getTime();

      filtered = filtered.filter((promo) => {
        if (!promo.endDateRaw) return false;

        try {
          const promoEndDate = new Date(promo.endDateRaw);
          if (isNaN(promoEndDate.getTime())) return false;
          promoEndDate.setHours(0, 0, 0, 0);
          const promoEndTimestamp = promoEndDate.getTime();

          return promoEndTimestamp >= fromTimestamp && promoEndTimestamp <= toTimestamp;
        } catch (error) {
          console.error("Error filtering by end date range:", error, promo);
          return false;
        }
      });
    }

    // Filter theo trạng thái
    if (statusFilter) {
      filtered = filtered.filter((promo) => promo.status === statusFilter);
    }

    setFilteredPromotions(filtered);
    setTotalRecords(filtered.length);
  }, [searchTerm, discountTypeFilter, startDateRange, endDateRange, statusFilter, promotions]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, discountTypeFilter, startDateRange, endDateRange, statusFilter]);

  const handleRefresh = () => {
    setSearchTerm("");
    setDiscountTypeFilter(null);
    setStartDateRange([null, null]);
    setEndDateRange([null, null]);
    setStatusFilter(null);
    setCurrentPage(1);
    fetchPromotions();
    message.success("Đã làm mới danh sách khuyến mãi thành công!");
  };

  // const handleExportExcel = async () => {
  //   if (!filteredPromotions || filteredPromotions.length === 0) {
  //     message.warning("Không có dữ liệu để xuất!");
  //     return;
  //   }

  //   const exportData = filteredPromotions.map((promo) => ({
  //     "Tên khuyến mãi": promo.promotionName,
  //     "Mô tả": promo.description,
  //     "Loại giảm giá": promo.discountType,
  //     "Giá trị": promo.discountValue,
  //     "Ngày bắt đầu": promo.startDate,
  //     "Ngày kết thúc": promo.endDate,
  //     "Số sản phẩm": promo.productCount,
  //     "Trạng thái": promo.status,
  //   }));

  //   try {
  //     await exportToExcel(exportData, "Danh_sach_khuyen_mai");
  //     message.success("Xuất Excel thành công!");
  //   } catch {
  //     message.error("Lỗi khi xuất Excel!");
  //   }
  // };

  const handleEdit = (promotionId) => {
    setSelectedPromotionId(promotionId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (promotion) => {
    setSelectedPromotion(promotion);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (promotionId) => {
    try {
      await deletePromotion(promotionId);
      await fetchPromotions();
      message.success("Khuyến mãi đã được xoá thành công!");
      setDeleteModalOpen(false);
      setSelectedPromotion(null);
    } catch (err) {
      console.error("❌ Lỗi khi xoá khuyến mãi:", err);
      const errorMsg = err.response?.data?.message || "Lỗi khi xoá khuyến mãi. Vui lòng thử lại.";
      message.error(errorMsg);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedPromotion(null);
  };

  const handleToggleStatus = async (promotion) => {
    try {
      await togglePromotionStatus(promotion.promotionId);
      await fetchPromotions();
      message.success("Đã cập nhật trạng thái khuyến mãi thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái khuyến mãi:", err);
      message.error("Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại.");
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
  }, [filteredPromotions, currentPage]);

  const DiscountTypeOptions = [
    { value: null, label: "Tất cả" },
    { value: "Giảm theo phần trăm", label: "Giảm theo phần trăm" },
    { value: "Giảm trực tiếp số tiền", label: "Giảm trực tiếp số tiền" },
  ];

  const StatusOptions = [
    { value: null, label: "Tất cả" },
    { value: "Hoạt động", label: "Hoạt động" },
    { value: "Hết hạn", label: "Hết hạn" },
    { value: "Không hoạt động", label: "Không hoạt động" },
  ];

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
          <input type="checkbox" data-id={data.promotionId} />
          <span className="checkmarks" />
        </label>
      ),
      sortable: false,
      key: "checked",
    },
    {
      header: "Tên khuyến mãi",
      field: "promotionName",
      sortable: true,
    },
    {
      header: "Loại giảm giá",
      field: "discountType",
      sortable: true,
    },
    {
      header: "Giá trị",
      field: "discountValueRaw", // Sort theo giá trị số thực tế
      sortable: true,
      body: (rowData) => rowData.discountValue, // Hiển thị giá trị đã format
    },
    {
      header: "Ngày bắt đầu",
      field: "startDate",
      sortable: true,
    },
    {
      header: "Ngày kết thúc",
      field: "endDate",
      sortable: true,
    },
    {
      header: "Số sản phẩm",
      field: "productCount",
      sortable: true,
      body: (rowData) => (
        <div style={{ textAlign: "center" }}>
          <span className="badge bg-info">{rowData.productCount}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      field: "status",
      sortable: true,
      body: (rowData) => (
        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge fw-medium fs-10 ${rowData.active
              ? "bg-success"
              : rowData.isExpired
                ? "bg-warning"
                : "bg-danger"
              }`}
          >
            {rowData.status}
          </span>
          {!rowData.isExpired && (
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={rowData.originalActive || false}
                onChange={() => handleToggleStatus(rowData)}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "",
      sortable: false,
      body: (rowData) => (
        <div className="action-table-data">
          <div className="edit-delete-action d-flex align-items-center">
            <button
              className="me-2 p-2 border rounded bg-transparent"
              onClick={() => handleEdit(rowData.promotionId)}
              title="Chỉnh sửa"
            >
              <i className="feather icon-edit"></i>
            </button>
            <button
              className="p-2 border rounded bg-transparent"
              onClick={() => handleDeleteClick(rowData)}
              title="Xóa"
            >
              <i className="feather icon-trash-2"></i>
            </button>
          </div>
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
                <h4 className="fw-bold">Khuyến mãi</h4>
                <h6>Quản lý danh sách khuyến mãi</h6>
              </div>
            </div>
            <TableTopHead
              showExcel={false}
              onRefresh={handleRefresh}
            />
            <div className="page-btn">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAddModalOpen(true)}
              >
                <i className="ti ti-circle-plus me-1" />
                Thêm khuyến mãi
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Bộ lọc */}
          <div className="card mb-3 shadow-sm">
            <div className="card-body p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCurrentPage(1);
                }}
                className="row g-3 align-items-end"
              >
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label fw-semibold text-dark mb-1">
                    Thời gian bắt đầu
                  </label>
                  <CommonDateRangePicker
                    value={startDateRange}
                    onChange={(newRange) => {
                      setStartDateRange(newRange);
                      setCurrentPage(1);
                    }}
                    className="w-100"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label fw-semibold text-dark mb-1">
                    Thời gian kết thúc
                  </label>
                  <CommonDateRangePicker
                    value={endDateRange}
                    onChange={(newRange) => {
                      setEndDateRange(newRange);
                      setCurrentPage(1);
                    }}
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
                    placeholder="Tên khuyến mãi, mô tả..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách khuyến mãi{" "}
                <span className="text-muted small">
                  ({filteredPromotions.length} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <div style={{ minWidth: "180px" }}>
                  <CommonSelect
                    options={DiscountTypeOptions}
                    value={
                      DiscountTypeOptions.find(
                        (o) => o.value === discountTypeFilter
                      ) || DiscountTypeOptions[0]
                    }
                    onChange={(s) => {
                      const v = s?.value;
                      setDiscountTypeFilter(v || null);
                      setCurrentPage(1);
                    }}
                    placeholder="Chọn loại giảm giá"
                    className="w-100"
                  />
                </div>
                <div style={{ minWidth: "180px" }}>
                  <CommonSelect
                    options={StatusOptions}
                    value={
                      StatusOptions.find(
                        (o) => o.value === statusFilter
                      ) || StatusOptions[0]
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
                    data={filteredPromotions}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="promotionId"
                    loading={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>

      <AddPromotionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchPromotions}
      />

      <EditPromotionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPromotionId(null);
        }}
        onSuccess={fetchPromotions}
        promotionId={selectedPromotionId}
      />

      <DeleteModal
        open={deleteModalOpen}
        itemId={selectedPromotion?.promotionId}
        itemName={selectedPromotion?.promotionName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default PromotionList;
