import React, { useState } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import {
  laptop,
  product1,
  product10,
  product11,
  product12,
  product13,
  product14,
  product15,
  product16,
  product17,
  product2,
  product3,
  product4,
  product5,
  product6,
  product7,
  product8,
  product9,
} from "../../utils/imagepath";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import CommonSelect from "../../components/select/common-select";
import DeleteModal from "../../components/delete-modal";
import SearchFromApi from "../../components/data-table/search";
import { Editor } from "primereact/editor";

export const subcateorydata = [
  {
    id: 1,
    img: product1,
    category: "Computers",
    parentcategory: "Computers",
    categorycode: "CT001",
    description: "Computers description",
    status: "Active",
  },
  {
    id: 2,
    img: product2,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT002",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 3,
    img: product3,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT003",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 4,
    img: product4,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT004",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 5,
    img: product5,
    category: "Accessories",
    parentcategory: "Accessories",
    categorycode: "CT005",
    description: "Accessories description",
    status: "Active",
  },
  {
    id: 6,
    img: product6,
    category: "Shoes",
    parentcategory: "Shoes",
    categorycode: "CT006",
    description: "Shoes description",
    status: "Active",
  },
  {
    id: 7,
    img: product7,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT007",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 8,
    img: product8,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT008",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 9,
    img: product9,
    category: "Computers",
    parentcategory: "Computers",
    categorycode: "CT009",
    description: "Computers description",
    status: "Active",
  },
  {
    id: 10,
    img: product10,
    category: "Health Care",
    parentcategory: "Health Care",
    categorycode: "CT0010",
    description: "Health Care description",
    status: "Active",
  },
  {
    id: 11,
    img: product11,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT004",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 12,
    img: product12,
    category: "Accessories",
    parentcategory: "Accessories",
    categorycode: "CT005",
    description: "Accessories description",
    status: "Active",
  },
  {
    id: 13,
    img: product13,
    category: "Shoes",
    parentcategory: "Shoes",
    categorycode: "CT006",
    description: "Shoes description",
    status: "Active",
  },
  {
    id: 14,
    img: product14,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT007",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 15,
    img: product15,
    category: "Fruits",
    parentcategory: "Fruits",
    categorycode: "CT008",
    description: "Fruits description",
    status: "Active",
  },
  {
    id: 16,
    img: product16,
    category: "Computers",
    parentcategory: "Computers",
    categorycode: "CT009",
    description: "Computers description",
    status: "Active",
  },
  {
    id: 17,
    img: product17,
    category: "Health Care",
    parentcategory: "Health Care",
    categorycode: "CT0010",
    description: "Health Care description",
    status: "Active",
  },
];

const SubCategories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, _setTotalRecords] = useState(5);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  const [selectedCategory, setSelectedCategory] = useState(null);
  const Category = [{ label: "Laptop", value: "1" }];
  const [text, setText] = useState("");

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
      field: "logo",
      header: "Image",
      key: "logo",
      sortable: true,
      body: (rowData) => (
        <span className="productimgname">
          <Link to="#" className="product-img stock-img">
            <img alt="" src={rowData.img} />
          </Link>
        </span>
      ),
    },
    {
      field: "parentcategory",
      header: "Sub Category",
      key: "parentcategory",
      sortable: true,
    },
    {
      field: "category",
      header: "Category",
      key: "category",
      sortable: true,
    },
    {
      field: "categorycode",
      header: "Category Code",
      key: "categorycode",
      sortable: true,
    },
    {
      field: "description",
      header: "Description",
      key: "description",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      key: "status",
      sortable: true,
      body: (rowData) => (
        <span className="badge bg-success fw-medium fs-10">
          {rowData.status}
        </span>
      ),
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (_row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            className="me-2 p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#edit-customer"
          >
            <i className="feather icon-edit"></i>
          </Link>
          <Link
            className="p-2 d-flex align-items-center border rounded"
            to="#"
            data-bs-toggle="modal"
            data-bs-target="#delete-modal"
          >
            <i className="feather icon-trash-2"></i>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <TableTopHead />
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>
                <SearchFromApi onSearch={handleSearch} />
              </div>
              <div>
                <Link
                  to="#"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#add-category"
                >
                  <i className="fa fa-plus me-2"></i>
                  Add Sub Category
                </Link>
              </div>
            </div>
            <PrimeDataTable
              value={subcateorydata}
              columns={columns}
              paginator
              rows={rows}
              totalRecords={totalRecords}
              first={(currentPage - 1) * rows}
              onPage={(e) => {
                setCurrentPage(e.page + 1);
                setRows(e.rows);
              }}
            />
          </div>
        </div>
      </div>
      <CommonFooter />

      {/* Add Sub Category Modal */}
      <div className="modal fade" id="add-category">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title">Add Sub Category</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Category</label>
                  <CommonSelect
                    selectedOption={selectedCategory}
                    onChange={setSelectedCategory}
                    options={Category}
                    className="select"
                  />
                </div>
                <div className="form-group">
                  <label>Sub Category Name</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Category Code</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <Editor value={text} onTextChange={(e) => setText(e.htmlValue)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="form-group text-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal />
    </div>
  );
};

export default SubCategories;
