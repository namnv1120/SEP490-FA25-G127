import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { allRoutes } from "../../routes/AllRoutes";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import { stockImg1 } from "../../utils/imagepath";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import {
  deleteProduct,
  importProducts,
  toggleProductStatus,
  searchProducts,
} from "../../services/ProductService";
import ImportProductModal from "./ImportProduct";
import ProductDetailModal from "../../core/modals/inventories/ProductDetailModal";
import { message } from "antd";
import { Modal } from "bootstrap";
import { exportToExcel } from "../../utils/excelUtils";
import { getImageUrl } from "../../utils/imageUtils";

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [products, setProducts] = useState([]);

  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const route = allRoutes;

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);

      const backendPage = currentPage - 1;

      const result = await searchProducts(
        searchQuery || "",
        backendPage,
        rows,
        "createdDate",
        "DESC"
      );

      const mappedProducts = (result.content || [])
        .filter((product) => product && product.productId != null)
        .map((product) => {
          const imageUrl = product.image || product.imageUrl || "";
          const fullImageUrl = getImageUrl(imageUrl) || stockImg1;

          return {
            productId: product.productId,
            productCode: product.productCode || "Không có",
            productName: product.productName || "Không có",
            productImage: fullImageUrl,
            category: product.categoryName || "Không có",
            description: product.description || "Không có",
            supplier: product.supplierName || "Không có",
            dimensions: product.dimensions || "Không có",
            imageUrl: imageUrl,
            unitprice: `${product.unitPrice?.toLocaleString() || "0.00"} đ`,
            rawUnitPrice: product.unitPrice || 0,
            unit: product.unit || "Không có",
            qty: product.quantityInStock?.toString() || "0",
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
  }, [currentPage, rows, searchQuery]);

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
    setSearchQuery(undefined);
    setCurrentPage(1);
    message.success("Danh sách sản phẩm đã được làm mới!");
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }, 0);
  };

  const handleDeleteConfirm = async (productId) => {
    try {
      await deleteProduct(productId);
      await fetchProducts();
      setSelectedProduct(null);

      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }

      message.success("Sản phẩm đã được xoá thành công!");
    } catch {
      message.error("Lỗi khi xoá sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleDeleteCancel = () => {
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
      header: "Giá",
      field: "unitprice",
      key: "unitprice",
      sortable: true,
      sortField: "rawUnitPrice",
    },
    {
      header: "Đơn vị",
      field: "unit",
      key: "unit",
      sortable: true,
    },
    {
      header: "Số lượng",
      field: "qty",
      key: "qty",
      sortable: true,
    },
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
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
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
