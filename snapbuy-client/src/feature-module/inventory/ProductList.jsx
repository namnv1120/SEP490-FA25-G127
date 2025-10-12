import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllProducts,
  deleteProduct,
} from "../../services/ProductService"; // 👈 import service
import Brand from "../../core/modals/inventory/brand";
import { all_routes } from "../../routes/all_routes";
import PrimeDataTable from "../../components/data-table";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Gọi API lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      response = await getAllProducts();


      // Nếu backend trả về phân trang (vd: { products: [], total: 50 })
      setProducts(response.products || response);
      setTotalRecords(response.total || response.length || 0);
    } catch (err) {
      console.error("❌ Lỗi khi fetch sản phẩm:", err);
      if (err.code === "ERR_NETWORK" || err.message.includes("Network Error")) {
        alert(
          "⚠️ Không thể kết nối đến server.\nVui lòng kiểm tra:\n- Backend đã chạy chưa?\n- URL API có đúng không?"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load khi page, rows hoặc search thay đổi
  useEffect(() => {
    fetchProducts();
  }, [currentPage, rows]);



  // ✅ Khi click nút xóa → mở modal
  const handleDeleteClick = (id) => {
    setSelectedId(id);
  };

  // ✅ Khi xóa thành công → reload data
  const handleDeleteSuccess = async () => {
    if (selectedId) {
      try {
        await deleteProduct(selectedId);
        fetchProducts();
      } catch (err) {
        console.error("❌ Lỗi khi xóa sản phẩm:", err);
      } finally {
        setSelectedId(null);
      }
    }
  };

  // ✅ Cấu hình cột bảng
  const columns = [
    { header: "Code", field: "productCode", sortable: true },
    {
      header: "Product",
      field: "productName",
      sortable: true,
      body: (data) => (
        <div className="d-flex align-items-center">
          <img
            src={data.productImage || "/placeholder-image.png"}
            alt={data.products}
            style={{
              width: "40px",
              height: "40px",
              marginRight: "10px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-image.png";
            }}
          />
          <span>{data.productName}</span>
        </div>
      ),
    },
    { header: "Category", field: "categoryName", sortable: true },
    { header: "Description", field: "description", sortable: true },
    { header: "Price", field: "unitPrice", sortable: true },
    { header: "Unit", field: "unit", sortable: true },

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
              {/* <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              /> */}
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
                    dataKey="productId"
                  />
                </div>
              )}
            </div>
          </div>

          <Brand />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        productId={selectedId}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default ProductList;
