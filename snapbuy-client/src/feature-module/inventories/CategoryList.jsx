import { useState, useEffect, useCallback, useMemo } from "react";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import CommonSelect from "../../components/select/common-select";
import {
  searchParentCategories,
  deleteCategory,
  toggleCategoryStatus,
} from "../../services/CategoryService";
import { message } from "antd";

import AddCategory from "../../core/modals/inventories/AddCategoryModal";
import EditCategory from "../../core/modals/inventories/EditCategoryModal";

const CategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: true, label: "Hoạt động" },
      { value: false, label: "Không hoạt động" },
    ],
    []
  );

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const backendPage = currentPage - 1;

      const result = await searchParentCategories(
        (searchQuery || "").trim(),
        backendPage,
        rows,
        "createdDate",
        "DESC"
      );

      const mapped = (result.content || []).map((cat) => ({
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
        status:
          cat.active === 1 || cat.active === true
            ? "Hoạt động"
            : "Không hoạt động",
        active: cat.active === 1 || cat.active === true,
      }));

      setCategories(mapped);
      setTotalRecords(result.totalElements || 0);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách danh mục:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(undefined);
    setStatusFilter(null);
    setCurrentPage(1);
    fetchCategories();
    message.success("Danh sách danh mục đã được làm mới!");
  };

  const handleEditClick = (category) => {
    setEditCategoryId(category.categoryId);
    setEditModalOpen(true);
  };

  // Xử lý khi click delete
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      await fetchCategories();
      message.success("Danh mục đã được xoá thành công!");
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error("❌ Lỗi khi xoá danh sách danh mục:", err);
      message.error("Lỗi khi xoá danh mục. Vui lòng thử lại.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleToggleStatus = async (category) => {
    try {
      await toggleCategoryStatus(category.categoryId);
      await fetchCategories();
      message.success("Đã cập nhật trạng thái danh mục thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái danh mục:", err);
      message.error("Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại.");
    }
  };

  const columns = [
    {
      header: "",
      body: (data) => (
        <div
          className="d-flex align-items-center justify-content-center"
          title={data.active ? "Đang hoạt động" : "Không hoạt động"}
        >
          {data.active ? (
            <i
              className="ti ti-circle-check-filled"
              style={{ fontSize: "18px", color: "#28a745" }}
            />
          ) : (
            <i
              className="ti ti-circle-x-filled"
              style={{ fontSize: "18px", color: "#dc3545" }}
            />
          )}
        </div>
      ),
      sortable: false,
      key: "statusIcon",
      style: { width: "50px", textAlign: "center" },
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
          {/* <button
            className="p-2 border rounded bg-transparent"
            onClick={() => handleDeleteClick(row)}
          >
            <i className="feather icon-trash-2"></i>
          </button> */}
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
            <TableTopHead showExcel={false} onRefresh={handleRefresh} />
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

          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách danh mục{" "}
                <span className="text-muted small">
                  ({totalRecords} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <div style={{ minWidth: "250px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên danh mục..."
                    value={searchQuery || ""}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div style={{ minWidth: "180px" }}>
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
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive category-table">
                {loading ? (
                  <div className="d-flex justify-content-center p-5">
                    <span
                      className="spinner-border text-primary"
                      role="status"
                    />
                  </div>
                ) : (
                  <PrimeDataTable
                    column={columns}
                    data={categories.filter((cat) => {
                      if (statusFilter === null) return true;
                      return cat.active === statusFilter;
                    })}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={
                      statusFilter === null
                        ? totalRecords
                        : categories.filter(
                            (cat) => cat.active === statusFilter
                          ).length
                    }
                    dataKey="categoryId"
                    serverSidePagination={statusFilter === null}
                  />
                )}
              </div>
            </div>
          </div>
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
        open={deleteModalOpen}
        itemId={selectedCategory?.categoryId}
        itemName={selectedCategory?.categoryName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default CategoryList;
