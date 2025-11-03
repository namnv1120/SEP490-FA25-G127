import React, { useState, useEffect } from "react";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { getAllCategories, deleteCategory } from "../../services/CategoryService";
import { message } from "antd";
import { Modal } from "bootstrap";

// ✅ Import 2 component mới
import AddSubCategory from "../../core/modals/inventories/AddSubCategoryModal";
import EditSubCategory from "../../core/modals/inventories/EditSubCategoryModal";

const SubCategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [subCategories, setSubCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      const parents = data.filter(
        (cat) => !cat.parentCategoryId || cat.parentCategoryId === null
      );

      const subs = data.filter(
        (cat) => cat.parentCategoryId && cat.parentCategoryId !== null
      );

      setParentCategories(parents);

      const mapped = subs.map((cat) => {
        const parent = parents.find((p) => p.categoryId === cat.parentCategoryId);

        return {
          categoryId: cat.categoryId,
          categoryName: cat.name || cat.categoryName || "Không có",
          parentCategoryName: parent ? (parent.name || parent.categoryName) : "Không có",
          parentCategoryId: cat.parentCategoryId,
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
        };
      });

      setSubCategories(mapped);
      setTotalRecords(mapped.length);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách danh mục con:", err);
      setError("Lỗi khi tải danh sách danh mục con. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleEditClick = (subCategory) => {
    setEditSubCategoryId(subCategory.categoryId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
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
      }, 300);

      await fetchSubCategories();
      message.success("Xoá danh mục con thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xoá danh mục con:", err);
      message.error("Không thể xoá danh mục con. Vui lòng thử lại.");
    } finally {
      setSelectedSubCategory(null);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedSubCategory(null);
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
      header: "Tên danh mục con",
      field: "categoryName",
      key: "categoryName",
      sortable: true,
    },
    {
      header: "Tên danh mục cha",
      field: "parentCategoryName",
      key: "parentCategoryName",
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
      header: "Ngày cập nhật",
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
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Danh mục con</h4>
                <h6>Quản lý danh sách danh mục con</h6>
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
                Thêm danh mục con
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
                    data={subCategories}
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

      {/* ✅ Add Sub Category Component */}
      <AddSubCategory
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        parentCategories={parentCategories}
        onSuccess={fetchSubCategories}
      />

      {/* ✅ Edit Sub Category Component */}
      {editSubCategoryId && (
        <EditSubCategory
          isOpen={editModalOpen}
          categoryId={editSubCategoryId}
          parentCategories={parentCategories}
          onSuccess={() => {
            fetchSubCategories();
            setEditSubCategoryId(null);
            setEditModalOpen(false);
          }}
          onClose={() => {
            setEditSubCategoryId(null);
            setEditModalOpen(false);
          }}
        />
      )}

      {/* ✅ Delete Modal */}
      <DeleteModal
        itemId={selectedSubCategory?.categoryId}
        itemName={selectedSubCategory?.categoryName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default SubCategoryList;
