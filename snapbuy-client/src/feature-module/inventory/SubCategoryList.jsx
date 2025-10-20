import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { getAllCategories, deleteCategory } from "../../services/CategoryService";
import { message } from "antd";
import { Modal } from "bootstrap";

// ✅ Import 2 component mới
import AddSubCategory from "../inventory/AddSubCategory";
import EditSubCategory from "../inventory/EditSubCategory";

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

  // Fetch categories
  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();

      // ✅ Tách parent và sub categories
      const parents = data.filter(
        (cat) => !cat.parentCategoryId || cat.parentCategoryId === null
      );
      
      const subs = data.filter(
        (cat) => cat.parentCategoryId && cat.parentCategoryId !== null
      );

      setParentCategories(parents);

      // ✅ Map sub categories với parent name
      const mapped = subs.map((cat) => {
        const parent = parents.find((p) => p.categoryId === cat.parentCategoryId);
        
        return {
          categoryId: cat.categoryId,
          categoryName: cat.name || cat.categoryName || "N/A",
          parentCategoryName: parent ? (parent.name || parent.categoryName) : "N/A",
          parentCategoryId: cat.parentCategoryId,
          description: cat.description || "N/A",
          createddate: cat.createdDate
            ? new Date(cat.createdDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          updateddate: cat.updatedDate
            ? new Date(cat.updatedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          status: cat.active === 1 || cat.active === true ? "Active" : "Inactive",
        };
      });

      setSubCategories(mapped);
      setTotalRecords(mapped.length);
    } catch (err) {
      console.error("❌ Error fetching sub categories:", err);
      setError("Failed to load sub categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleEditClick = (subCategory) => {
    setEditSubCategoryId(subCategory.categoryId);
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
      message.success("Sub category deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting sub category:", err);
      message.error("Failed to delete sub category. Please try again.");
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
      header: "Sub Category",
      field: "categoryName",
      key: "categoryName",
      sortable: true,
    },
    {
      header: "Parent Category",
      field: "parentCategoryName",
      key: "parentCategoryName",
      sortable: true,
    },
    {
      header: "Description",
      field: "description",
      key: "description",
      sortable: true,
    },
    {
      header: "Created Date",
      field: "createddate",
      key: "createddate",
      sortable: true,
    },
    {
      header: "Updated Date",
      field: "updateddate",
      key: "updateddate",
      sortable: true,
    },
    {
      header: "Status",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => (
        <span
          className={`badge fw-medium fs-10 ${
            data.status === "Active" ? "bg-success" : "bg-danger"
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
                <h4 className="fw-bold">Sub Categories</h4>
                <h6>Manage your sub categories</h6>
              </div>
            </div>
            <TableTopHead />
            <div className="page-btn">
              <Link
                to="#"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#add-sub-category"
              >
                <i className="ti ti-circle-plus me-1"></i>
                Add Sub Category
              </Link>
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
                <span className="visually-hidden">Loading...</span>
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
        parentCategories={parentCategories}
        onSuccess={fetchSubCategories} 
      />

      {/* ✅ Edit Sub Category Component */}
      {editSubCategoryId && (
        <EditSubCategory
          categoryId={editSubCategoryId}
          parentCategories={parentCategories}
          onSuccess={() => {
            fetchSubCategories();
            setEditSubCategoryId(null);
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
