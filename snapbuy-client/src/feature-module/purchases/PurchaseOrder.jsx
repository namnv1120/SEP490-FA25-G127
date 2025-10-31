import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommonFooter from "../../components/footer/commonFooter";
import TableTopHead from "../../components/table-top-head";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import { getAllPurchaseOrders, deletePurchaseOrder } from "../../services/PurchaseOrderService";
import { message, Spin } from "antd";
import { all_routes } from "../../routes/all_routes";
import DeleteModal from "../../components/delete-modal";
import { Modal } from "bootstrap";

const PurchaseOrder = () => {
  const route = all_routes;
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState(undefined);
  const [selectedItem, setSelectedItem] = useState(null);

  // ✅ Format ngày giờ
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

  // ✅ Format tiền tệ
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "—";
    return `${Number(amount).toLocaleString("vi-VN")} ₫`;
  };

  // ✅ Badge trạng thái
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
      default:
        return <span className="badge bg-secondary">Không xác định</span>;
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // ✅ Fetch danh sách đơn hàng
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllPurchaseOrders();

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

  // ✅ Mở modal xác nhận xoá
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setTimeout(() => {
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      } else {
        console.error("❌ Không tìm thấy modal xoá");
      }
    }, 0);
  };

  // ✅ Xác nhận xoá
  const handleDeleteConfirm = async (purchaseOrderId) => {
    try {
      await deletePurchaseOrder(purchaseOrderId);
      await fetchPurchaseOrders();
      setSelectedItem(null);

      // Đóng modal thủ công
      const modalElement = document.getElementById("delete-modal");
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }

      message.success("Đã xoá đơn đặt hàng thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi xoá đơn hàng:", error);
      message.error("Không thể xoá đơn đặt hàng!");
    }
  };

  // ✅ Huỷ xoá
  const handleDeleteCancel = () => {
    setSelectedItem(null);
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
    { header: "Mã tạo đơn", field: "purchaseOrderNumber", key: "purchaseOrderNumber" },
    { header: "Nhà cung cấp", field: "supplierName", key: "supplierName" },
    { header: "Người tạo đơn", field: "fullName", key: "fullName" },
    {
      header: "Ngày tạo phiếu",
      body: (row) => formatDateTime(row.orderDate),
      field: "orderDate",
      key: "orderDate",
    },
    {
      header: "Ngày nhận phiếu",
      body: (row) => formatDateTime(row.receivedDate),
      field: "receivedDate",
      key: "receivedDate",
    },
    {
      header: "Tổng tiền",
      body: (row) => formatCurrency(row.totalAmount),
      field: "totalAmount",
      key: "totalAmount",
    },
    {
      header: "Trạng thái",
      body: (row) => renderStatusBadge(row.status),
      field: "status",
      key: "status",
    },
    {
      header: "",
      field: "actions",
      key: "actions",
      sortable: false,
      body: (row) => (
        <div className="edit-delete-action d-flex align-items-center">
          <Link
            to={route.editpurchaseorder?.replace(":id", row.purchaseOrderId)}
            className="me-2 p-2 border rounded bg-transparent"
          >
            <i className="feather icon-edit"></i>
          </Link>
          <button
            className="p-2 d-flex align-items-center border rounded bg-transparent"
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
                <h4>Đơn đặt hàng</h4>
                <h6>Quản lý danh sách đơn đặt hàng về kho</h6>
              </div>
            </div>
            <TableTopHead onRefresh={fetchPurchaseOrders} />
            <div className="page-btn">
              <Link to={route.addpurchaseorder} className="btn btn-primary">
                <i className="ti ti-circle-plus me-1"></i>
                Tạo đơn đặt hàng
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <SearchFromApi callback={handleSearch} rows={rows} setRows={setRows} />
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

        {/* Modal xác nhận xoá */}
        <DeleteModal
          itemId={selectedItem?.purchaseOrderId}
          itemName={selectedItem?.purchaseOrderNumber}
          onDelete={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        <CommonFooter />
      </div>
    </>
  );
};

export default PurchaseOrder;
