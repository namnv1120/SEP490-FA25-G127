import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../routes/all_routes";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import { stockImg1 } from "../../utils/imagepath";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { getAllProducts, deleteProduct, importProducts } from "../../services/ProductService";
import ImportProductModal from "./ImportProduct";
import { message } from "antd";
import { Modal } from "bootstrap";
import { exportToExcel } from "../../utils/excelUtils";

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const route = all_routes;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();

      // Map API data to match table structure
      const mappedProducts = data.map((product, index) => ({
        productId: product.productId || index + 1,
        productCode: product.code || product.productCode || "N/A",
        productName: product.name || product.productName || "N/A",
        productImage: product.image || product.imageUrl || stockImg1,
        category: product.category?.name || product.categoryName || "N/A",
        description: product.description || "N/A",
        supplier: product.supplier?.name || product.supplierName || "N/A",
        dimensions: product.dimensions || "N/A",
        imageUrl: product.image || product.imageUrl || "",
        unitprice: `${product.unitPrice?.toLocaleString() || "0.00"} đ`,
        unit: product.unit || "N/A",
        qty: product.quantity?.toString() || product.qty?.toString() || "0",
      }));
      setProducts(mappedProducts);
      setTotalRecords(mappedProducts.length);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!products || products.length === 0) {
      message.warning("No product data to export!");
      return;
    }

    const exportData = products.map(p => ({
      Code: p.productCode,
      Name: p.productName,
      Description: p.description || "",
      Category: p.category,
      Supplier: p.supplier || "",
      Unit: p.unit,
      Dimension: p.dimensions || "",
      Image: p.imageUrl
    }));

    exportToExcel(exportData, "Product_List");
  };

  const handleImport = async (data) => {
    try {
      console.log("📦 Importing products:", data);
      await importProducts(data); // Gọi API
      await fetchProducts(); // Refresh list
      return Promise.resolve();
    } catch (error) {
      console.error("❌ Import error:", error);
      return Promise.reject(error);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    message.success("Product list refreshed!");
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      const modalElement = document.getElementById('delete-modal');
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      } else {
        console.error("Delete modal not found in DOM");
      }
    }, 0);
  };


  const handleDeleteConfirm = async (productId) => {
    try {
      await deleteProduct(productId);
      fetchProducts();
      setSelectedProduct(null);

      // 🔒 Đóng modal thủ công
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }

      message.success("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Failed to delete product.");
    }
  };


  const handleDeleteCancel = () => {
    setSelectedProduct(null);
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
      header: "Code",
      field: "productCode",
      key: "productCode",
      sortable: true,
    },
    {
      header: "Product Name",
      field: "productName",
      key: "productName",
      sortable: true,
      body: (data) => (
        <div className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-md me-2">
            <img alt="" src={data.productImage} />
          </Link>
          <Link to={`${route.productdetails}/${data.productId}`}>{data.productName}</Link>
        </div>
      ),
    },
    {
      header: "Category",
      field: "category",
      key: "category",
      sortable: true,
    },
    {
      header: "Price",
      field: "unitprice",
      key: "unitprice",
      sortable: true,
    },
    {
      header: "Unit",
      field: "unit",
      key: "unit",
      sortable: true,
    },
    {
      header: "Qty",
      field: "qty",
      key: "qty",
      sortable: true,
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
            to={`${route.editproduct}/${row.productId}`}
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
                <h4>Product List</h4>
                <h6>Manage your products</h6>
              </div>
            </div>
            <TableTopHead
              onExportExcel={handleExportExcel}
              onRefresh={handleRefresh}
            />
            <div className="page-btn">
              <Link to={route.addproduct} className="btn btn-primary">
                <i className="ti ti-circle-plus me-1"></i>
                Add New Product
              </Link>
            </div>
            <div className="page-btn import">
              <button
                className="btn btn-secondary color"
                onClick={() => setShowImportModal(true)}
              >
                <i className="feather icon-download feather me-2" />
                Import Product
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Product List Table */}
          {!loading && (
            <div className="card table-list-card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
                <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                </div>
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
                  />
                </div>
              </div>
            </div>
          )}
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
    </>
  );
};

export default ProductList;