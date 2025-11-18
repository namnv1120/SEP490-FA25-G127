import { useState, useEffect } from "react";
import { Modal as AntdModal, message, Spin } from "antd";
import { Modal as BootstrapModal } from "bootstrap";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import CommonFooter from "../../components/footer/CommonFooter";

import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} from "../../services/CustomerService";

const Customers = () => {
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setListData(data);
      setTotalRecords(data.length || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEditClick = async (customer) => {
    setSelectedCustomerId(customer.customerId);
    setEditModalOpen(true);

    try {
      setModalLoading(true);
      const customerData = await getCustomerById(customer.customerId);
      setFormData({
        fullName: customerData.fullName || "",
        phone: customerData.phone || "",
        gender: customerData.gender || "",
      });
    } catch (error) {
      message.error("Không thể tải dữ liệu khách hàng");
      setEditModalOpen(false);
      setSelectedCustomerId(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedCustomerId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedFullName = formData.fullName.trim();

    if (!trimmedFullName || trimmedFullName.length < 2 || trimmedFullName.length > 50) {
      message.error("Họ và tên phải từ 2 đến 50 ký tự");
      return;
    }

    try {
      setModalLoading(true);

      const updateData = {
        fullName: trimmedFullName,
        gender: formData.gender,
      };

      await updateCustomer(selectedCustomerId, updateData);
      message.success("Cập nhật khách hàng thành công!");

      handleModalClose();
      fetchCustomers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật khách hàng";
      message.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
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
    { header: "Mã KH", field: "customerCode", key: "customerCode" },
    { header: "Tên khách hàng", field: "fullName", key: "fullName" },
    { header: "Số điện thoại", field: "phone", key: "phone" },
    {
      header: "Giới tính",
      field: "gender",
      key: "gender",
      body: (data) => {
        const gender = data.gender?.toLowerCase();
        if (gender === "male" || gender === "m") return "Nam";
        if (gender === "female" || gender === "f") return "Nữ";
        return "Khác";
      },
    },
    {
      header: "Tích điểm",
      field: "points",
      key: "points",
      body: (data) => {
        const points = data.points ?? 0;
        return (
          <span className="fw-bold text-primary">
            {new Intl.NumberFormat('vi-VN').format(points)} điểm
          </span>
        );
      },
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
          onClick={() => {
            setCustomerToDelete(row);
            setTimeout(() => {
              const modalElement = document.getElementById("delete-modal");
              if (modalElement) {
                const modal = new BootstrapModal(modalElement);
                modal.show();
              }
            }, 0);
          }}
          >
            <i className="feather icon-trash-2"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4 className="fw-bold">Khách hàng</h4>
              <h6>Quản lý danh sách khách hàng</h6>
            </div>
          </div>
          <TableTopHead />
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <SearchFromApi
              callback={setSearchQuery}
              rows={rows}
              setRows={setRows}
            />
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <PrimeDataTable
                column={columns}
                data={listData}
                rows={rows}
                setRows={setRows}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalRecords={totalRecords}
                dataKey="customerId"
              />
            </div>
          </div>
        </div>
      </div>

      <CommonFooter />
      <DeleteModal
        itemId={customerToDelete?.customerId}
        itemName={customerToDelete?.fullName}
        onDelete={async (id) => {
          try {
            await import("../../services/CustomerService").then(({ deleteCustomer }) => deleteCustomer(id));
            const modalElement = document.getElementById("delete-modal");
            const modal = BootstrapModal.getInstance(modalElement);
            if (modal) modal.hide();
            setTimeout(() => {
              document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
              document.body.classList.remove("modal-open");
              document.body.style.removeProperty("overflow");
              document.body.style.removeProperty("padding-right");
            }, 0);
            await fetchCustomers();
            message.success("Xoá khách hàng thành công!");
          } catch (err) {
            message.error("Lỗi khi xoá khách hàng. Vui lòng thử lại.");
          } finally {
            setCustomerToDelete(null);
          }
        }}
        onCancel={() => setCustomerToDelete(null)}
      />

      <AntdModal
        open={editModalOpen}
        onCancel={handleModalClose}
        onOk={handleSubmit}
        footer={null}
        width={600}
        closable={true}
        title={
          <div>
            <h4 className="mb-0">Chỉnh sửa khách hàng</h4>
          </div>
        }
      >
        {modalLoading && !formData.fullName ? (
          <div className="d-flex justify-content-center p-4">
            <Spin size="large" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Họ và tên<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={modalLoading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                disabled={true}
                readOnly
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small className="text-muted">Số điện thoại không thể thay đổi</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <select
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={modalLoading}
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div className="modal-footer-btn mt-4 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-cancel me-2"
                onClick={handleModalClose}
                disabled={modalLoading}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={modalLoading}
              >
                {modalLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </AntdModal>
    </div>
  );
};

export default Customers;
