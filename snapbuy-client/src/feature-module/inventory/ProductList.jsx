import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Brand from "../../core/modals/inventory/brand";
import { all_routes } from "../../routes/all_routes";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";

const API_BASE_URL = "http://localhost:8080/api"; // ⚠️ cập nhật cho đúng backend

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); // ✅ lưu productId khi click delete

  // ✅ Gọi API lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`, {
        params: { page: currentPage, limit: rows, search: searchQuery },
      });
      setProducts(res.data?.products || []);
      setTotalRecords(res.data?.total || 0);
    } catch (err) {
      console.error("❌ Lỗi khi fetch sản phẩm:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, rows, searchQuery]);

  // ✅ Hàm tìm kiếm
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // ✅ Khi click vào nút xoá → mở modal & lưu ID
  const handleDeleteClick = (id) => {
    setSelectedId(id);
  };

  // ✅ Hàm xoá sản phẩm (sẽ được gọi trong DeleteModal)
  const handleDeleteConfirm = async () => {
    if (!selectedId) return;

    try {
      await axios.delete(`${API_BASE_URL}/products/${selectedId}`);
      alert("✅ Sản phẩm đã được xoá!");
      fetchProducts(); // load lại danh sách sau khi xoá
    } catch (err) {
      console.error("❌ Lỗi khi xoá sản phẩm:", err);
      alert("Xoá thất bại!");
    }
  };

  // ✅ Cấu hình cột bảng
  const columns = [
    { header: "SKU", field: "sku", sortable: true },
    {
      header: "Product",
      field: "product",
      sortable: true,
      body: (data) => (
        <div className="d-flex align-items-center">
          <img
            src={data.productImage}
            alt={data.product}
            style={{ width: "40px", height: "40px", marginRight: "10px" }}
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
            onClick={() => handleDeleteClick(data.id)} // ✅ lưu ID vào state
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

          <TableTopHead />

          <div className="card mt-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
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
                />
              </div>
            </div>
          </div>

          <Brand />
        </div>
      </div>

      {/* ✅ Gọi modal cuối trang + truyền hàm xoá */}
      <DeleteModal onConfirm={handleDeleteConfirm} />
    </>
  );
};

export default ProductList;
