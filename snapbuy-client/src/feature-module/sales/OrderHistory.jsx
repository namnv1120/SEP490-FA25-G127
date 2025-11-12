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
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const OrderStatuses = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const calculateTotal = (item) => {
    const possibleKeys = [
      "lineItems",
      "orderDetails",
      "items",
      "orderLines",
      "orderItems",
      "details",
    ];
    for (const key of possibleKeys) {
      const arr = item[key];
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.reduce((sum, li) => {
          const price =
            Number(li.price) ||
            Number(li.unitPrice) ||
            Number(li.amount) ||
            0;
          const qty =
            Number(li.quantity) ||
            Number(li.qty) ||
            Number(li.count) ||
            1;
          return sum + price * qty;
        }, 0);
      }
    }
    return 0;
  };

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
        customerName: selectedCustomerName || null,
        status: selectedStatus || null,
        from,
        to,
      };

      console.log("=== Tham số gửi API ===", params);
      const response = await getAllOrders(params);
      const data = response?.content || response || [];

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu trả về không phải mảng");
      }

      if (data.length > 0) {
        console.log("Cấu trúc mẫu:", JSON.stringify(data[0], null, 2));
      }

      const normalizedData = data.map((item, index) => {
        const total = calculateTotal(item);
        const employeeName =
          item.employeeName ||
          item.staffName ||
          item.createdBy ||
          "-";

        return {
          key: item.orderId || `temp-${index}-${Date.now()}`,
          orderId: item.orderId || "-",
          orderNumber: item.orderNumber || `ORD-${String(index + 1).padStart(5, "0")}`,
          orderDate: item.orderDate || item.createdAt || item.date || null,
          customerName: item.customerName || "Khách lẻ",
          total,
          status: item.status || "PENDING",
          employeeName,
        };
      });

      setListData(normalizedData);
      setTotalRecords(response?.totalElements || normalizedData.length);
    } catch (err) {
      console.error("=== Lỗi khi gọi API ===", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải dữ liệu đơn hàng. Vui lòng thử lại.";
      setError(msg);
      setListData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, rows, selectedCustomerName, selectedStatus, dateRange]);

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
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
      sorter: (a, b) => new Date(a.orderDate || 0) - new Date(b.orderDate || 0),
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
      sorter: (a, b) => (a.employeeName || "").localeCompare(b.employeeName || ""),
      render: (name) => (
        <span className={name === "-" ? "text-muted" : "fw-medium"}>
          {name}
        </span>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => (a.total || 0) - (b.total || 0),
      render: (total) => {
        const amount = Number(total);
        if (isNaN(amount) || amount <= 0) {
          return <span className="text-muted small">0 ₫</span>;
        }
        return (
          <strong className="text-success">
            {amount.toLocaleString("vi-VN")} ₫
          </strong>
        );
      },
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
          CANCELLED: { class: "bg-danger", text: "Đã hủy" },
        }[status] || { class: "bg-secondary", text: status || "Không rõ" };
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
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Nguyễn Văn A"
                  value={selectedCustomerName}
                  onChange={(e) => setSelectedCustomerName(e.target.value.trim())}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-3">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
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
              loading={loading}
            />
          </div>
        </div>
      </div>

      <CommonFooter />
    </div>
  );
};

export default OrderHistory;