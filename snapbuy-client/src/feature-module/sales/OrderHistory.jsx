import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TooltipIcons from "../../components/tooltip-content/tooltipIcons";
import Datatable from "../../core/pagination/datatable";
import CommonSelect from "../../components/select/common-select";
import CommonDateRangePicker from "../../components/date-range-picker/common-date-range-picker";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import { getAllOrders } from "../../services/OrderService";

const OrderHistory = () => {
  const [listData, setListData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const OrderStatuses = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "SHIPPED", label: "Đã giao" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const from = dateRange[0]
        ? new Date(dateRange[0]).toISOString().split("T")[0]
        : null;
      const to = dateRange[1]
        ? new Date(dateRange[1]).toISOString().split("T")[0]
        : null;

      const params = {
        page: currentPage - 1,
        size: rows,
        customerId: selectedCustomer || null,
        employeeId: selectedEmployee || null,
        status: selectedStatus || null,
        from,
        to,
      };

      console.log("=== Tham số gửi lên API ===", params);
      const data = await getAllOrders(params);
      console.log("=== Dữ liệu trả về từ API ===", data);

      if (!data || !Array.isArray(data.content)) {
        throw new Error("Phản hồi API không đúng định dạng hoặc rỗng");
      }

      const normalizedData = data.content.map((item, index) => ({
        orderId: item.orderId || `temp-${index}-${Date.now()}`,
        orderDate: item.orderDate,
        customerName: item.customerName,
        employeeName: item.employeeName,
        total: item.total,
        status: item.status,
      }));

      console.log("=== Dữ liệu sau khi chuẩn hóa ===", normalizedData);

      setListData(normalizedData);
      setTotalRecords(data.totalElements || 0);
    } catch (err) {
      console.error("=== Lỗi khi gọi API ===", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu đơn hàng. Vui lòng kiểm tra kết nối hoặc API."
      );
      setListData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rows, selectedCustomer, selectedEmployee, selectedStatus, dateRange]);

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId.localeCompare(b.orderId),
      render: (text) => (
        <Link to="#" className="text-primary fw-medium small">
          {text}
        </Link>
      ),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      render: (text) =>
        text
          ? new Date(text).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (text) => <span className="fw-medium">{text}</span>,
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => a.total - b.total,
      render: (total) => (
        <strong className="text-success">
          {total?.toLocaleString("vi-VN")} ₫
        </strong>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        const badge = {
          PENDING: { class: "bg-warning", text: "Chờ xử lý" },
          CONFIRMED: { class: "bg-primary", text: "Đã xác nhận" },
          SHIPPED: { class: "bg-success", text: "Đã giao" },
          CANCELLED: { class: "bg-danger", text: "Đã hủy" },
        }[status] || { class: "bg-secondary", text: status };
        return <span className={`badge ${badge.class} small`}>{badge.text}</span>;
      },
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Lịch Sử Đơn Hàng</h4>
              <h6>Theo dõi các đơn hàng đã đặt và xử lý</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <RefreshIcon onClick={loadOrders} loading={loading} />
            <CollapesIcon />
          </ul>
        </div>

        <div className="card mb-3 shadow-sm">
          <div className="card-body p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
                loadOrders();
              }}
              className="row g-3 align-items-end"
            >
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Khoảng thời gian
                </label>
                <CommonDateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Trạng thái đơn hàng
                </label>
                <CommonSelect
                  options={OrderStatuses}
                  value={OrderStatuses.find(
                    (item) => item.value === selectedStatus
                  )}
                  onChange={(selected) =>
                    setSelectedStatus(selected?.value || "")
                  }
                  placeholder="Chọn trạng thái"
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark mb-1">
                  Mã khách hàng
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: CUS001"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value.trim())}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Đang tải..." : "Tìm kiếm"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách đơn hàng{" "}
              <span className="text-muted small">({totalRecords} bản ghi)</span>
            </h5>
            <ul className="table-top-head">
              <TooltipIcons />
              <li>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="In"
                  className="text-muted"
                >
                  <i className="ti ti-printer fs-5" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="card-body p-0">
            {error && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 mx-3 mt-3"
                role="alert"
              >
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}
            <Datatable
              columns={columns}
              dataSource={listData}
              current={currentPage}
              pageSize={rows}
              total={totalRecords}
              onChange={(page, size) => {
                setCurrentPage(page);
                setRows(size);
              }}
              onShowSizeChange={(page, size) => {
                setCurrentPage(page);
                setRows(size);
              }}
            />
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default OrderHistory;