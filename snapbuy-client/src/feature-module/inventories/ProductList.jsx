import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { allRoutes } from "../../routes/AllRoutes";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import { stockImg1 } from "../../utils/imagepath";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import CommonSelect from "../../components/select/common-select";
import {
  deleteProduct,
  importProducts,
  toggleProductStatus,
  searchProductsPaged,
} from "../../services/ProductService";
import { getAllCategories } from "../../services/CategoryService";
import ImportProductModal from "./ImportProduct";
import ProductDetailModal from "../../core/modals/inventories/ProductDetailModal";
import { message, Spin } from "antd";
import { exportToExcel } from "../../utils/excelUtils";
import { getImageUrl } from "../../utils/imageUtils";

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // true=Hoạt động, false=Không hoạt động, null=Tất cả
  const [categoryFilter, setCategoryFilter] = useState(null); // UUID của parent category
  const [subCategoryFilter, setSubCategoryFilter] = useState(null); // UUID của sub category
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const route = allRoutes;

  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: true, label: "Hoạt động" },
      { value: false, label: "Không hoạt động" },
    ],
    []
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const backendPage = Math.max(0, (currentPage || 1) - 1);
      const params = {
        keyword: searchQuery || undefined,
        active: statusFilter,
        categoryId: categoryFilter || undefined,
        subCategoryId: subCategoryFilter || undefined,
        page: backendPage,
        size: rows,
        sortBy: "createdDate",
        sortDir: "DESC",
      };

      const result = await searchProductsPaged(params);

      const mappedProducts = (result.content || [])
        .filter((product) => product && product.productId != null)
        .map((product) => {
          const imageUrl = product.image || product.imageUrl || "";
          const fullImageUrl = getImageUrl(imageUrl) || stockImg1;

          let categoryDisplay = product.categoryName || "Không có";
          let subCategoryDisplay = "";

          if (product.subCategoryName) {
            categoryDisplay = product.parentCategoryName || product.categoryName || "Không có";
            subCategoryDisplay = product.subCategoryName;
          } else if (product.parentCategoryId) {
            categoryDisplay = product.categoryName || "Không có";
            subCategoryDisplay = "";
          } else {
            categoryDisplay = product.categoryName || "Không có";
            subCategoryDisplay = "";
          }

          return {
            productId: product.productId,
            productCode: product.productCode || "Không có",
            productName: product.productName || "Không có",
            productImage: fullImageUrl,
            category: categoryDisplay,
            subCategory: subCategoryDisplay,
            description: product.description || "Không có",
            supplier: product.supplierName || "Không có",
            dimensions: product.dimensions || "Không có",
            imageUrl: imageUrl,
            unitprice: `${product.unitPrice?.toLocaleString() || "0.00"} đ`,
            rawUnitPrice: product.unitPrice || 0,
            status:
              product.active === 1 || product.active === true
                ? "Hoạt động"
                : "Không hoạt động",
            active: product.active === 1 || product.active === true,
          };
        });

      setProducts(mappedProducts);
      setTotalRecords(result.totalElements || 0);
    } catch {
      setError("Lỗi khi tải danh sách sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchQuery, statusFilter, categoryFilter, subCategoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getAllCategories();
        setAllCategories(categories || []);
      } catch {
        // Ignore error
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, subCategoryFilter]);

  const parentCategoryOptions = useMemo(() => {
    const parents = (allCategories || [])
      .filter((cat) => !cat.parentCategoryId && cat.active)
      .map((cat) => ({ label: cat.categoryName, value: cat.categoryId }));
    return [{ value: null, label: "Tất cả" }, ...parents];
  }, [allCategories]);

  const subCategoryOptions = useMemo(() => {
    if (!categoryFilter) {
      return [{ value: null, label: "Tất cả" }];
    }
    const subs = (allCategories || [])
      .filter((cat) => cat.parentCategoryId === categoryFilter && cat.active)
      .map((cat) => ({ label: cat.categoryName, value: cat.categoryId }));
    return [{ value: null, label: "Tất cả" }, ...subs];
  }, [allCategories, categoryFilter]);

  const handleExportExcel = async () => {
    if (!products || products.length === 0) {
      message.warning("Không có sản phẩm để xuất!");
      return;
    }

    const exportData = products.map((p) => ({
      "Mã sản phẩm": p.productCode,
      "Tên sản phẩm": p.productName,
      "Mô tả": p.description || "",
      "Danh mục": p.category,
      "Nhà cung cấp": p.supplier || "",
      "Đơn vị": p.unit,
      "Kích thước": p.dimensions || "",
      Ảnh: p.imageUrl,
    }));

    try {
      await exportToExcel(exportData, "Danh_sach_san_pham");
    } catch {
      message.error("Lỗi khi xuất file Excel!");
    }
  };

  const handleImport = async (data) => {
    try {
      const result = await importProducts(data);
      const imported = Array.isArray(result) ? result : [];
      const importedCodes = new Set(
        imported
          .map((p) => (p.productCode || "").trim().toLowerCase())
          .filter((c) => c)
      );
      const failed = data.filter(
        (row) =>
          !importedCodes.has((row.productCode || "").trim().toLowerCase())
      );

      await fetchProducts();

      if (failed.length > 0) {
        const okCount = imported.length;
        const total = data.length;
        const failedCodes = failed
          .map((r) => r.productCode)
          .filter(Boolean)
          .join(", ");
        const msg = `Nhập ${okCount}/${total} dòng. Các mã bị bỏ qua: ${failedCodes}`;
        const err = new Error(msg);
        return Promise.reject(err);
      }

      return Promise.resolve();
    } catch {
      return Promise.reject(error);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setCategoryFilter(null);
    setSubCategoryFilter(null);
    setCurrentPage(1);
    fetchProducts();
    message.success("Danh sách sản phẩm đã được làm mới!");
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (productId) => {
    try {
      await deleteProduct(productId);
      await fetchProducts();
      message.success("Sản phẩm đã được xoá thành công!");
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch {
      message.error("Lỗi khi xoá sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const handleToggleStatus = async (product) => {
    try {
      await toggleProductStatus(product.productId);
      await fetchProducts();
      message.success("Đã cập nhật trạng thái sản phẩm thành công!");
    } catch {
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
  }, [products, currentPage]);

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
          <input type="checkbox" data-id={data.productId} />
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
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            <img
              alt={data.productName}
              src={data.productImage}
              onError={(e) => {
                e.target.src = stockImg1; // Fallback to default image
              }}
            />
          </Link>
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
        </div>
      ),
    },
    {
      header: "Danh mục",
      field: "category",
      key: "category",
      sortable: true,
    },
    {
      header: "Danh mục con",
      field: "subCategory",
      key: "subCategory",
      sortable: true,
      body: (data) => data.subCategory || "",
    },
    {
      header: "Giá",
      field: "unitprice",
      key: "unitprice",
      sortable: true,
      sortField: "rawUnitPrice",
    },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge fw-medium fs-10 ${data.status === "Hoạt động" ? "bg-success" : "bg-danger"
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
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to={route.editproduct.replace(":id", row.productId)}
          >
            <i className="feather icon-edit"></i>
          </Link>
          <button
            className="p-2 d-flex align-items-center border rounded bg-transparent"
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
                <h4 className="fw-bold">Danh sách sản phẩm</h4>
                <h6>Quản lý danh sách sản phẩm</h6>
              </div>
            </div>
            <TableTopHead
              onExportExcel={handleExportExcel}
              onRefresh={handleRefresh}
            />
            <div className="page-btn">
              <Link to={route.addproduct} className="btn btn-primary">
                <i className="ti ti-circle-plus me-1"></i>
                Thêm sản phẩm mới
              </Link>
            </div>
            <div className="page-btn import">
              <button
                className="btn btn-secondary color"
                onClick={() => setShowImportModal(true)}
              >
                <i className="feather icon-download feather me-2" />
                Nhập sản phẩm từ Excel
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Layout với sidebar filter và table list */}
          <div className="row g-3">
            {/* Sidebar Filter - Bên trái */}
            <div className="col-12 col-md-3 col-lg-3">
              <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
                <div className="card-header bg-light-subtle px-3 py-2">
                  <h6 className="mb-0 fw-semibold">
                    <i className="feather icon-filter me-2"></i>
                    Bộ lọc
                  </h6>
                </div>
                <div className="card-body p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setCurrentPage(1);
                    }}
                    className="d-flex flex-column gap-3"
                  >
                    <div>
                      <label className="form-label fw-semibold text-dark mb-2">
                        Tìm kiếm
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tên sản phẩm, mã sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div>
                      <label className="form-label fw-semibold text-dark mb-2">
                        Trạng thái
                      </label>
                      <CommonSelect
                        options={StatusOptions}
                        value={
                          StatusOptions.find((o) => o.value === statusFilter) ||
                          StatusOptions[0]
                        }
                        onChange={(s) => {
                          const v = s?.value;
                          setStatusFilter(v === true || v === false ? v : null);
                          setCurrentPage(1);
                        }}
                        placeholder="Chọn trạng thái"
                        className="w-100"
                      />
                    </div>
                    <div>
                      <label className="form-label fw-semibold text-dark mb-2">
                        Danh mục
                      </label>
                      <CommonSelect
                        options={parentCategoryOptions}
                        value={
                          parentCategoryOptions.find(
                            (o) => o.value === (categoryFilter || null)
                          ) || parentCategoryOptions[0]
                        }
                        onChange={(s) => {
                          const v = s?.value;
                          setCategoryFilter(v || null);
                          setSubCategoryFilter(null); // Reset sub category khi đổi parent category
                          setCurrentPage(1);
                        }}
                        placeholder="Chọn danh mục"
                        className="w-100"
                      />
                    </div>
                    <div>
                      <label className="form-label fw-semibold text-dark mb-2">
                        Danh mục con
                      </label>
                      <CommonSelect
                        options={subCategoryOptions}
                        value={
                          subCategoryOptions.find(
                            (o) => o.value === (subCategoryFilter || null)
                          ) || subCategoryOptions[0]
                        }
                        onChange={(s) => {
                          const v = s?.value;
                          setSubCategoryFilter(v || null);
                          setCurrentPage(1);
                        }}
                        placeholder="Chọn danh mục con"
                        className="w-100"
                        disabled={!categoryFilter}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={handleRefresh}
                    >
                      <i className="feather icon-refresh-cw me-2"></i>
                      Làm mới
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Table List - Bên phải */}
            <div className="col-12 col-md-9 col-lg-9">
              <div className="card table-list-card no-search shadow-sm">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
                  <h5 className="mb-0 fw-semibold">
                    Danh sách sản phẩm{" "}
                    <span className="text-muted small">
                      ({totalRecords} bản ghi)
                    </span>
                  </h5>
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
                        data={products}
                        rows={rows}
                        setRows={setRows}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalRecords={totalRecords}
                        dataKey="productId"
                        serverSidePagination={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
      <DeleteModal
        open={deleteModalOpen}
        itemId={selectedProduct?.productId}
        itemName={selectedProduct?.productName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <ImportProductModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
      <ProductDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
      />
    </>
  );
};

export default ProductList;
