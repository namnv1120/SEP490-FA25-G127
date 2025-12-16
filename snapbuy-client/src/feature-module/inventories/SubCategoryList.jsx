import React, { useState, useEffect, useCallback, useMemo } from "react";
import CommonFooter from "../../components/footer/CommonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import CommonSelect from "../../components/select/common-select";
import {
  getAllCategories,
  searchSubCategories,
  deleteCategory,
  toggleCategoryStatus,
} from "../../services/CategoryService";
import { message } from "antd";

import AddSubCategory from "../../core/modals/inventories/AddSubCategoryModal";
import EditSubCategory from "../../core/modals/inventories/EditSubCategoryModal";

const SubCategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null=Tất cả, true=Hoạt động, false=Không hoạt động
  const [subCategories, setSubCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);
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

  // Fetch parent categories once for dropdowns
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const data = await getAllCategories();
        const parents = data.filter(
          (cat) => !cat.parentCategoryId || cat.parentCategoryId === null
        );
        setParentCategories(parents);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh mục cha:", err);
      }
    };
    fetchParentCategories();
  }, []);

  const fetchSubCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const backendPage = currentPage - 1;

      const result = await searchSubCategories(
        (searchQuery || "").trim(),
        backendPage,
        rows,
        "createdDate",
        "DESC"
      );

      // Map with current parentCategories (don't fetch inside this function)
      const mapped = (result.content || []).map((cat) => {
        const parent = parentCategories.find(
          (p) => p.categoryId === cat.parentCategoryId
        );

        return {
          categoryId: cat.categoryId,
          categoryName: cat.name || cat.categoryName || "Không có",
          parentCategoryName: parent
            ? parent.name || parent.categoryName
            : "Không có",
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
          status:
            cat.active === 1 || cat.active === true
              ? "Hoạt động"
              : "Không hoạt động",
          active: cat.active === 1 || cat.active === true,
        };
      });

      setSubCategories(mapped);
      setTotalRecords(result.totalElements || 0);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách danh mục con:", err);
      setError("Lỗi khi tải danh sách danh mục con. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rows, searchQuery, parentCategories]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  const handleRefresh = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(undefined);
    setStatusFilter(null);
    setCurrentPage(1);
    fetchSubCategories();
    message.success("Danh sách danh mục con đã được làm mới!");
  };

  const handleEditClick = (subCategory) => {
    setEditSubCategoryId(subCategory.categoryId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      await fetchSubCategories();
      message.success("Xoá danh mục con thành công!");
      setDeleteModalOpen(false);
      setSelectedSubCategory(null);
    } catch (err) {
      console.error("❌ Lỗi khi xoá danh mục con:", err);
      message.error("Không thể xoá danh mục con. Vui lòng thử lại.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedSubCategory(null);
  };

  const handleToggleStatus = async (subCategory) => {
    try {
      await toggleCategoryStatus(subCategory.categoryId);
      await fetchSubCategories();
      message.success("Đã cập nhật trạng thái danh mục con thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái danh mục con:", err);
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
  }, [subCategories, currentPage]);

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
          <input type="checkbox" data-id={data.categoryId} />
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
            <TableTopHead showExcel={false} onRefresh={handleRefresh} />
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

          <div className="card table-list-card no-search shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
              <h5 className="mb-0 fw-semibold">
                Danh sách danh mục con{" "}
                <span className="text-muted small">
                  ({totalRecords} bản ghi)
                </span>
              </h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <div style={{ minWidth: "250px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên danh mục con..."
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
                    data={subCategories.filter((cat) => {
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
                        : subCategories.filter(
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
        open={deleteModalOpen}
        itemId={selectedSubCategory?.categoryId}
        itemName={selectedSubCategory?.categoryName}
        onDelete={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default SubCategoryList;
