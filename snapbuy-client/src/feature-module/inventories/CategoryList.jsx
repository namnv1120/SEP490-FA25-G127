import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { getAllCategories, deleteCategory } from "../../services/CategoryService";
import { message } from "antd";
import { Modal } from "bootstrap";

import AddCategory from "../../core/modals/inventory/AddCategoryModal";
import EditCategory from "../../core/modals/inventory/EditCategoryModal";

const CategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();

      const parentCategories = data.filter(
        (cat) => !cat.parentCategoryId || cat.parentCategoryId === null
      );

      const mapped = parentCategories.map((cat) => ({
        categoryId: cat.categoryId,
        categoryName: cat.name || cat.categoryName || "Không có",
        description: cat.description || "Không có",
        createddate: cat.createdDate
          ? new Date(cat.createdDate).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          : "Không có",
        updateddate: cat.updatedDate
          ? new Date(cat.updatedDate).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          : "Không có",
        status: cat.active === 1 || cat.active === true ? "Hoạt động" : "Không hoạt động",

      }));

      setCategories(mapped);
      setTotalRecords(mapped.length);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách danh mục:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleEditClick = (category) => {
    setEditCategoryId(category.categoryId);
    setEditModalOpen(true);
  };

  // Xử lý khi click delete
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      } else {
        console.error("❌ Không tìm thấy phần tử modal xoá.");
      }
    }, 0);
  };

  const handleDeleteConfirm = async (categoryId) => {
    try {
      await deleteCategory(categoryId);

      const modalElement = document.getElementById("delete-modal");
      const modal = Modal.getInstance(modalElement);

      if (modal) {
        modal.hide();
      }

      setTimeout(() => {
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }, 0);

      await fetchCategories();
      message.success("Danh muc đã được xoá thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xoá danh sách danh mục:", err);
      message.error("Lỗi khi xoá danh mục. Vui lòng thử lại.");
    } finally {
      setSelectedCategory(null);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedCategory(null);
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
      header: "Tên danh mục",
      field: "categoryName",
      key: "categoryName",
      sortable: true,
    },
    {
      header: "Mô tả",
      field: "description",
      key: "description",
      sortable: true,
    },
    {
      header: "Ngày tạo",
      field: "createddate",
      key: "createddate",
      sortable: true,
    },
    {
      header: "Ngày chỉnh sửa",
      field: "updateddate",
      key: "updateddate",
      sortable: true,
    },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <span
          className={`badge fw-medium fs-10 ${data.status === "Hoạt động" ? "bg-success" : "bg-danger"
            }`}
        >
          {data.status}
        </span>
      ),
    },
    {
      header: "",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <button
            className="me-2 p-2 border rounded bg-transparent"
            onClick={() => handleEditClick(row)}
          >
            <i className="feather icon-edit"></i>
          </button>
          <button
            className="p-2 border rounded bg-transparent"
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
                <h4 className="fw-bold">Danh mục</h4>
                <h6>Quản lý danh mục</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAddModalOpen(true)}
              >
                <i className="ti ti-circle-plus me-1"></i>
                Thêm danh mục
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          )}

          {!loading && (
            <div className="card table-list-card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
              </div>
              <div className="card-body">
                <div className="table-responsive category-table">
                  <PrimeDataTable
                    column={columns}
                    data={categories}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="categoryId"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
        <CommonFooter />
      </div>

      <AddCategory
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCategories}
      />
      {editCategoryId && (
        <EditCategory
          isOpen={editModalOpen}
          categoryId={editCategoryId}
          onSuccess={() => {
            fetchCategories();
            setEditCategoryId(null);
            setEditModalOpen(false);
          }}
          onClose={() => {
            setEditCategoryId(null);
            setEditModalOpen(false);
          }}
        />
      )}

      <DeleteModal
        itemId={selectedCategory?.categoryId}
        itemName={selectedCategory?.categoryName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default CategoryList;
