import { useState } from "react";
import { Link } from "react-router-dom";
import PrimeDataTable from "../../components/data-table";
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import CommonDatePicker from "../../components/date-picker/common-date-picker";
import CommonSelect from "../../components/select/common-select";
import SearchFromApi from "../../components/data-table/search";

export const inventoryData = [
  {
    id: 1,
    product_id: "P001",
    product: "Lenovo 3rd Generation",
    quantity_in_stock: 3,
    minimum_stock: 5,
    maximum_stock: 50,
    reorder_point: 4,
    last_updated: "2025-10-10",
  },
  {
    id: 2,
    product_id: "P002",
    product: "Nike Jordan",
    quantity_in_stock: 12,
    minimum_stock: 10,
    maximum_stock: 60,
    reorder_point: 8,
    last_updated: "2025-10-12",
  },
  {
    id: 3,
    product_id: "P003",
    product: "Apple Series 5 Watch",
    quantity_in_stock: 1,
    minimum_stock: 4,
    maximum_stock: 40,
    reorder_point: 2,
    last_updated: "2025-10-13",
  },
];

const InventoryList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, _setTotalRecords] = useState(5);
  const [rows, setRows] = useState(10);
  const [date1, setDate1] = useState(new Date());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryList, _setInventoryList] = useState(inventoryData);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const ProductList = [
    { label: "Lenovo 3rd Generation", value: "1" },
    { label: "Nike Jordan", value: "2" },
    { label: "Apple Series 5 Watch", value: "3" },
  ];

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
      header: "Mã sản phẩm",
      field: "product_id",
      key: "product_id",
      sortable: true,
    },
    {
      header: "Tên sản phẩm",
      field: "product",
      key: "product",
      sortable: true,
    },
    {
      header: "Số lượng tồn",
      field: "quantity_in_stock",
      key: "quantity_in_stock",
      sortable: true,
      body: (data) => (
        <span
          className={
            data.quantity_in_stock < data.minimum_stock
              ? "text-danger fw-semibold"
              : ""
          }
        >
          {data.quantity_in_stock}
        </span>
      ),
    },
    {
      header: "Tồn tối thiểu",
      field: "minimum_stock",
      key: "minimum_stock",
      sortable: true,
    },
    {
      header: "Tồn tối đa",
      field: "maximum_stock",
      key: "maximum_stock",
      sortable: true,
    },
    {
      header: "Điểm đặt hàng lại",
      field: "reorder_point",
      key: "reorder_point",
      sortable: true,
    },
    {
      header: "Ngày cập nhật",
      field: "last_updated",
      key: "last_updated",
      sortable: true,
      body: (data) => (
        <span>{new Date(data.last_updated).toLocaleDateString("vi-VN")}</span>
      ),
    },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      sortable: false,
      body: (data) => {
        if (data.quantity_in_stock < data.minimum_stock)
          return <span className="badge bg-danger">Thiếu hàng</span>;
        if (data.quantity_in_stock > data.maximum_stock)
          return <span className="badge bg-warning">Quá tồn</span>;
        return <span className="badge bg-success">Ổn định</span>;
      },
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
            data-bs-target="#edit-inventory"
          >
            <i className="feather icon-edit"></i>
          </Link>
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
                <h4>Quản lý tồn kho</h4>
                <h6>Theo dõi lượng hàng, cảnh báo thiếu hoặc quá tồn</h6>
              </div>
            </div>
            <TableTopHead />
          </div>

          <>
            {/* Danh sách tồn kho */}
            <div className="card table-list-card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <SearchFromApi
                  callback={handleSearch}
                  rows={rows}
                  setRows={setRows}
                />
                <div className="d-flex align-items-center flex-wrap row-gap-3">
                  <CommonDatePicker value={date1} onChange={setDate1} />
                </div>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <PrimeDataTable
                    column={columns}
                    data={inventoryList}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                  />
                </div>
              </div>
            </div>
          </>
        </div>
        <CommonFooter />
      </div>

      {/* Modal chỉnh sửa */}
      <div className="modal fade" id="edit-inventory">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header">
                  <div className="page-title">
                    <h4>Chỉnh sửa tồn kho</h4>
                  </div>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Tên sản phẩm</label>
                      <CommonSelect
                        className="w-100"
                        options={ProductList}
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.value)}
                        placeholder="Chọn sản phẩm"
                      />
                    </div>

                    <div className="mb-3">
                      <label>Số lượng tồn</label>
                      <input type="number" className="form-control" />
                    </div>

                    <div className="mb-3">
                      <label>Ngày cập nhật</label>
                      <div className="input-groupicon calender-input">
                        <CommonDatePicker
                          value={date1}
                          onChange={setDate1}
                          className="w-100"
                        />
                        <i className="feather icon-calendar info-img" />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Hủy
                  </button>
                  <Link
                    to="#"
                    data-bs-dismiss="modal"
                    className="btn btn-primary"
                  >
                    Lưu thay đổi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
