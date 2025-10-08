import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Brand from "../../core/modals/inventory/brand";
import { all_routes } from "../../routes/all_routes";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";

const API_BASE_URL = "http://localhost:8080/api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Gọi API lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/products`, {
        params: { page: currentPage, limit: rows, search: searchQuery },
      });
      setProducts(res.data?.products || []);
      setTotalRecords(res.data?.total || 0);
    } catch (err) {
      console.error("❌ Lỗi khi fetch sản phẩm:", err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        alert("⚠️ Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend đã chạy chưa?\n- URL API có đúng không?");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, rows, searchQuery]);

  // Hàm tìm kiếm
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Khi click vào nút xoá → mở modal & lưu ID
  const handleDeleteClick = (id) => {
    setSelectedId(id);
  };

  // Hàm được gọi sau khi xóa thành công
  const handleDeleteSuccess = () => {
    setSelectedId(null);
    fetchProducts();
  };

  // Cấu hình cột bảng
  const columns = [
    { header: "SKU", field: "sku", sortable: true },
    {
      header: "Product",
      field: "product",
      sortable: true,
      body: (data) => (
        <div className="d-flex align-items-center">
          <img
            src={data.productImage || "/placeholder-image.png"}
            alt={data.product}
            style={{ 
              width: "40px", 
              height: "40px", 
              marginRight: "10px",
              objectFit: "cover",
              borderRadius: "4px"
            }}
            onError={(e) => {
              e.target.src = "/placeholder-image.png";
            }}
          />
          <span>{data.product}</span>
        </div>
      ),
    },
    { header: "Category", field: "category", sortable: true },
    { header: "Brand", field: "brand", sortable: true },
    { header: "Price", field: "price", sortable: true },
    { header: "Unit", field: "unit", sortable: true },
    { header: "Qty", field: "qty", sortable: true },
    { header: "Created By", field: "createdby", sortable: true },
    {
      header: "Actions",
      body: (data) => (
        <div className="d-flex">
          <Link
            className="btn btn-sm btn-outline-primary me-2"
            to={`${all_routes.addproduct}/edit/${data.id}`}
          >
            Edit
          </Link>
          <button
            className="btn btn-sm btn-outline-danger"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal"
            onClick={() => handleDeleteClick(data.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header d-flex justify-content-between align-items-center">
            <div>
              <h4>Product List</h4>
              <h6>Manage your products</h6>
            </div>
            <Link to={all_routes.addproduct} className="btn btn-primary">
              + Add New Product
            </Link>
          </div>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <SearchFromApi 
                callback={handleSearch} 
                rows={rows} 
                setRows={setRows} 
              />
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <PrimeDataTable
                    column={columns}
                    data={products}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                  />
                </div>
              )}
            </div>
          </div>

          <Brand />
        </div>
      </div>

      {/* Truyền productId và callback vào DeleteModal */}
      <DeleteModal 
        productId={selectedId}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default ProductList;