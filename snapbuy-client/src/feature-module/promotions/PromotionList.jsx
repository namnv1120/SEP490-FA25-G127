import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonFooter from "../../components/footer/CommonFooter";
import SearchFromApi from "../../components/data-table/search";
import { getAllPromotions } from "../../services/PromotionService";
import AddPromotionModal from "../../core/modals/promotions/AddPromotionModal";
import EditPromotionModal from "../../core/modals/promotions/EditPromotionModal";
import { exportToExcel } from "../../utils/excelUtils";

const PromotionList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);

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
          startDate: formatDateTime(promo.startDate),
          endDate: formatDateTime(promo.endDate),
          productCount: promo.productIds?.length || 0,
          status: isActive
            ? "Hoạt động"
            : isExpired
            ? "Hết hạn"
            : "Không hoạt động",
          active: isActive,
          isExpired: isExpired,
        };
      });

      setPromotions(mappedData);
      setFilteredPromotions(mappedData);
      setTotalRecords(mappedData.length);
    } catch {
      setError("Lỗi khi tải danh sách khuyến mãi. Vui lòng thử lại.");
      message.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleSearch = (query) => {
    if (!query || query.trim() === "") {
      setFilteredPromotions(promotions);
      setTotalRecords(promotions.length);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = promotions.filter(
      (promo) =>
        promo.promotionName.toLowerCase().includes(lowerQuery) ||
        promo.description.toLowerCase().includes(lowerQuery)
    );

    setFilteredPromotions(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchPromotions();
    message.success("Đã làm mới danh sách");
  };

  const handleExportExcel = async () => {
    if (!filteredPromotions || filteredPromotions.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = filteredPromotions.map((promo) => ({
      "Tên khuyến mãi": promo.promotionName,
      "Mô tả": promo.description,
      "Loại giảm giá": promo.discountType,
      "Giá trị": promo.discountValue,
      "Ngày bắt đầu": promo.startDate,
      "Ngày kết thúc": promo.endDate,
      "Số sản phẩm": promo.productCount,
      "Trạng thái": promo.status,
    }));

    try {
      await exportToExcel(exportData, "Danh_sach_khuyen_mai");
      message.success("Xuất Excel thành công!");
    } catch {
      message.error("Lỗi khi xuất Excel!");
    }
  };

  const handleEdit = (promotionId) => {
    setSelectedPromotionId(promotionId);
    setEditModalOpen(true);
  };

  const columns = [
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
      field: "discountValue",
      sortable: true,
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
        <span
          className={`badge ${
            rowData.active
              ? "bg-success"
              : rowData.isExpired
              ? "bg-warning"
              : "bg-danger"
          }`}
        >
          {rowData.status}
        </span>
      ),
    },
    {
      header: "Thao tác",
      body: (rowData) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <button
              className="btn btn-sm btn-icon bg-light me-2"
              onClick={() => handleEdit(rowData.promotionId)}
              title="Chỉnh sửa"
            >
              <i className="ti ti-edit text-primary" />
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
                <h4>Khuyến mãi</h4>
                <h6>Quản lý danh sách khuyến mãi</h6>
              </div>
            </div>
            <TableTopHead
              onExportExcel={handleExportExcel}
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
                  data={filteredPromotions}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                  dataKey="promotionId"
                  loading={loading}
                />
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
    </>
  );
};

export default PromotionList;
