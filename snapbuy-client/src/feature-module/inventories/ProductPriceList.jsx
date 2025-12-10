import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ProductDetailModal from "../../core/modals/inventories/ProductDetailModal";
import { allRoutes } from "../../routes/AllRoutes";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import { message, Spin } from "antd";
import CommonSelect from "../../components/select/common-select";
import { exportToExcel } from "../../utils/excelUtils";
import { getAllProductPrices } from "../../services/ProductPriceService";
import ImportProductPrice from "./ImportProductPrice";
import { removeVietnameseTones } from "../../utils/stringUtils";

const ProductPriceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [_totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [productPrices, setProductPrices] = useState([]);
  const [error, setError] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceCondition, setPriceCondition] = useState(null); // Điều kiện so sánh giá bán vs giá nhập
  const [loading, setLoading] = useState(false);

  const route = allRoutes;

  // Các tùy chọn điều kiện so sánh giá
  const priceConditionOptions = [
    { value: null, label: "Tất cả" },
    { value: "gt", label: "Lớn hơn (>)" },
    { value: "gte", label: "Lớn hơn hoặc bằng (≥)" },
    { value: "eq", label: "Bằng (=)" },
    { value: "lt", label: "Nhỏ hơn (<)" },
    { value: "lte", label: "Nhỏ hơn hoặc bằng (≤)" },
  ];

  const fetchProductPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProductPrices();

      // Map API data to match table structure
      const mappedPrices = data.map((price) => ({
        priceId: price.priceId,
        productId: price.productId,
        productCode: price.productCode || "Không có",
        productName: price.productName || "Không có",
        unitPrice: `${price.unitPrice?.toLocaleString() || "0.00"} đ`,
        costPrice: `${price.costPrice?.toLocaleString() || "0.00"} đ`,
        validFrom: price.validFrom
          ? new Date(price.validFrom).toLocaleDateString("vi-VN")
          : "Không có",
        validTo: price.validTo
          ? new Date(price.validTo).toLocaleDateString("vi-VN")
          : "Không có",
        createdDate: price.createdDate
          ? new Date(price.createdDate).toLocaleString("vi-VN")
          : "Không có",
        status: getStatus(price.validFrom, price.validTo),
        // Raw values for filtering/sorting
        rawUnitPrice: price.unitPrice,
        rawCostPrice: price.costPrice,
        rawValidFrom: price.validFrom,
        rawValidTo: price.validTo,
      }));

      setProductPrices(mappedPrices);
      setTotalRecords(mappedPrices.length);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách giá sản phẩm:", err);
      setError("Không thể tải danh sách giá sản phẩm. Vui lòng thử lại sau.");
      message.error(
        "Không thể tải danh sách giá sản phẩm. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductPrices();
  }, [fetchProductPrices]);

  const getStatus = (validFrom, validTo) => {
    const now = new Date();
    if (!validFrom) return "Không hoạt động";

    const from = new Date(validFrom);
    const to = validTo ? new Date(validTo) : null;

    // Nếu trong thời gian còn hiệu lực => Hoạt động
    if (from <= now && (!to || to >= now)) {
      return "Hoạt động";
    }
    return "Không hoạt động";
  };

  const handleExportExcel = async () => {
    if (!productPrices || productPrices.length === 0) {
      message.warning("Không có dữ liệu để xuất.");
      return;
    }

    const exportData = productPrices.map((p) => ({
      "Tên sản phẩm": p.productName,
      "Giá bán": p.unitPrice,
      "Giá nhập": p.costPrice,
      "Hiệu lực từ": p.validFrom,
      "Hiệu lực đến": p.validTo,
      "Trạng thái": p.status,
      "Ngày tạo": p.createdDate,
    }));

    try {
      await exportToExcel(exportData, "Danh_sach_gia_san_pham");
    } catch {
      message.error("Lỗi khi xuất file Excel!");
    }
  };

  const handleImportSuccess = () => {
    fetchProductPrices();
    setShowImportModal(false);
  };

  const filteredList = productPrices.filter((item) => {
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

    // Filter theo điều kiện giá (so sánh giá bán với giá nhập)
    if (priceCondition) {
      const unitPrice = item.rawUnitPrice || 0;
      const costPrice = item.rawCostPrice || 0;
      switch (priceCondition) {
        case "gt": // Giá bán lớn hơn giá nhập
          if (!(unitPrice > costPrice)) return false;
          break;
        case "gte": // Giá bán lớn hơn hoặc bằng giá nhập
          if (!(unitPrice >= costPrice)) return false;
          break;
        case "eq": // Giá bán bằng giá nhập
          if (unitPrice !== costPrice) return false;
          break;
        case "lt": // Giá bán nhỏ hơn giá nhập
          if (!(unitPrice < costPrice)) return false;
          break;
        case "lte": // Giá bán nhỏ hơn hoặc bằng giá nhập
          if (!(unitPrice <= costPrice)) return false;
          break;
        default:
          break;
      }
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
  }, [productPrices, currentPage]);

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
          <input type="checkbox" data-id={data.priceId} />
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
    {
      header: "Giá bán",
      field: "unitPrice",
      key: "unitPrice",
      sortable: true,
      sortField: "rawUnitPrice",
    },
    {
      header: "Giá nhập",
      field: "costPrice",
      key: "costPrice",
      sortable: true,
      sortField: "rawCostPrice",
    },
    // {
    //   header: "Valid From",
    //   field: "validFrom",
    //   key: "validFrom",
    //   sortable: true,
    // },
    // {
    //   header: "Valid To",
    //   field: "validTo",
    //   key: "validTo",
    //   sortable: true,
    // },
    // {
    //   header: "Trạng thái",
    //   field: "status",
    //   key: "status",
    //   sortable: true,
    //   body: (data) => getStatusBadge(data.status),
    // },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to={route.editproductprice.replace(":id", row.priceId)}
          >
            <i className="feather icon-edit"></i>
          </Link>
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
                <h4 className="fw-bold">Danh sách giá sản phẩm</h4>
                <h6>Quản lý danh sách giá sản phẩm</h6>
              </div>
            </div>
            <TableTopHead
              showExcel={true}
              onExportExcel={handleExportExcel}
              onRefresh={(e) => {
                if (e) e.preventDefault();
                fetchProductPrices();
                message.success("Đã làm mới danh sách giá sản phẩm!");
              }}
            />
            <div className="page-btn">
              <button
                className="btn btn-primary"
                onClick={() => setShowImportModal(true)}
              >
                <i className="ti ti-upload me-1"></i>
                Nhập giá từ Excel
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Product Price List Table */}
          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách giá sản phẩm{" "}
                <span className="text-muted small">
                  ({filteredList.length} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-3 align-items-end flex-wrap">
                <div style={{ minWidth: "250px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên sản phẩm, mã sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                      // Hiệu ứng loading ngắn khi tìm kiếm
                      setLoading(true);
                      setTimeout(() => setLoading(false), 200);
                    }}
                  />
                </div>
                <div style={{ minWidth: "220px" }}>
                  <CommonSelect
                    options={priceConditionOptions}
                    value={
                      priceConditionOptions.find(
                        (o) => o.value === priceCondition
                      ) || priceConditionOptions[0]
                    }
                    onChange={(s) => {
                      const v = s?.value;
                      setPriceCondition(v || null);
                      setCurrentPage(1);
                      setLoading(true);
                      setTimeout(() => setLoading(false), 200);
                    }}
                    placeholder="Giá bán so với giá nhập"
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
                    dataKey="priceId"
                    loading={loading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
      <ProductDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
      />
      <ImportProductPrice
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};

export default ProductPriceList;
