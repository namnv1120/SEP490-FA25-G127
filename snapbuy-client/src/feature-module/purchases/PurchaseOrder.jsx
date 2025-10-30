import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import { getAllPurchaseOrders } from "../../services/PurchaseOrderService";
import { message, Spin } from "antd";

const PurchaseOrder = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);

  // ✅ Định dạng ngày giờ kiểu Việt Nam
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Định dạng tiền tệ
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "—";
    return `${Number(amount).toLocaleString("vi-VN")} ₫`;
  };

  // ✅ Badge trạng thái có màu
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "chờ duyệt":
        return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
      case "đã duyệt":
        return <span className="badge bg-info">Đã duyệt</span>;
      case "đã nhận hàng":
        return <span className="badge bg-success">Đã nhận hàng</span>;
      case "đã huỷ":
        return <span className="badge bg-danger">Đã huỷ</span>;
    }
  };

  // ✅ Cột bảng
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
      key: "select",
    },
    { header: "Nhà cung cấp", field: "supplierName", key: "supplierName" },
    { header: "Người tạo đơn", field: "fullName", key: "fullName" },
    {
      header: "Ngày tạo phiếu",
      body: (row) => formatDateTime(row.orderDate),
      key: "orderDate",
    },
    {
      header: "Ngày nhận phiếu",
      body: (row) => formatDateTime(row.receivedDate),
      key: "receivedDate",
    },
    {
      header: "Tổng tiền",
      body: (row) => formatCurrency(row.totalAmount),
      key: "totalAmount",
    },
    {
      header: "Trạng thái",
      body: (row) => renderStatusBadge(row.status),
      key: "status",
    },
    {
      header: "",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <button
            className="me-2 p-2 border rounded bg-transparent"
          // onClick={() => handleEditClick(row)}
          >
            <i className="feather icon-edit"></i>
          </button>
          <button
            className="p-2 border rounded bg-transparent"
            onClick={() => message.info("Tính năng xoá sẽ thêm sau")}
          >
            <i className="feather icon-trash-2"></i>
          </button>
        </div>
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // ✅ Gọi API lấy dữ liệu
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllPurchaseOrders();

      // 🔹 Chuẩn hoá dữ liệu
      const formatted = data.map((item) => ({
        ...item,
        orderDate: item.orderDate || item.createdAt,
        receivedDate: item.receivedDate || null,
        totalAmount: item.totalAmount ?? 0,
        status: item.status || "Chờ duyệt",
      }));

      setListData(formatted);
      setTotalRecords(formatted.length);
    } catch (error) {
      console.error("❌ Lỗi khi tải đơn hàng:", error);
      message.error("Không thể tải danh sách đơn đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="page-title">
                <h4>Đơn đặt hàng</h4>
                <h6>Quản lý danh sách các đơn đặt hàng về kho</h6>
              </div>
            </div>
            <TableTopHead onRefresh={fetchPurchaseOrders} />
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi
                callback={handleSearch}
                rows={rows}
                setRows={setRows}
              />
              <div className="d-flex table-dropdown my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white btn-md d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last Month
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Last 7 Days
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                {loading ? (
                  <div className="d-flex justify-content-center p-5">
                    <Spin size="large" />
                  </div>
                ) : (
                  <PrimeDataTable
                    column={columns}
                    data={listData}
                    rows={rows}
                    setRows={setRows}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={totalRecords}
                    dataKey="purchaseOrderId"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
    </div>
  );
};

export default PurchaseOrder;
