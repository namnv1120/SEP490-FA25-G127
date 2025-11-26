import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { allRoutes } from "../../routes/AllRoutes";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import { stockImg1 } from "../../utils/imagepath";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
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
import { message } from "antd";
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
      void 0;
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
    message.success("Danh sách sản phẩm đã được làm mới!");
  };

  const handleSearch = (value) => {
    setSearchQuery(value || "");
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
                <h4>Danh sách sản phẩm</h4>
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

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="search-set">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
              </div>
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-2">
                  <CommonSelect
                    options={StatusOptions}
                    value={
                      StatusOptions.find((o) => o.value === statusFilter) ||
                      StatusOptions[0]
                    }
                    onChange={(s) => {
                      const v = s?.value;
                      setStatusFilter(v === true || v === false ? v : null);
                    }}
                    placeholder="Trạng thái"
                    width={180}
                    className=""
                  />
                </div>
                <div className="me-2">
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
                    }}
                    placeholder="Danh mục"
                    width={200}
                    className=""
                  />
                </div>
                <div>
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
                    }}
                    placeholder="Danh mục con"
                    width={200}
                    className=""
                    disabled={!categoryFilter}
                  />
                </div>
              </div>
              {/* <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                  <div className="dropdown me-2">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      Category
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Computers
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Electronics
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Shoe
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Electronics
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      Sort By : Last 7 Days
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Recently Added
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Ascending
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Desending
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Last Month
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="dropdown-item rounded-1">
                          Last 7 Days
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div> */}
            </div>
            <div className="card-body">
              <div className="table-responsive">
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
