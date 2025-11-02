import { useState, useEffect } from "react";
import { Modal } from "bootstrap";
import { message } from "antd";
import PrimeDataTable from "../../components/data-table";
import SearchFromApi from "../../components/data-table/search";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import CommonFooter from "../../components/footer/commonFooter";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} from "../../services/CustomerService";

const Customers = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState("");

  // 🟢 State cho modal edit
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  // 🟢 Load danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setListData(data);
      setTotalRecords(data.length || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🟢 Khi nhấn nút edit
  const handleEditClick = async (customer) => {
    setSelectedCustomerId(customer.customerId);

    try {
      setModalLoading(true);
      const customerData = await getCustomerById(customer.customerId);
      setFormData({
        fullName: customerData.fullName || "",
        phone: customerData.phone || "",
        gender: customerData.gender || "",
      });

      const modalElement = document.getElementById("edit-customer-modal");
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    } catch (error) {
      message.error("Không thể tải dữ liệu khách hàng");
    } finally {
      setModalLoading(false);
    }
  };

  // 🟢 Đóng modal
  const handleModalClose = () => {
    const modalElement = document.getElementById("edit-customer-modal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    // Cleanup backdrop
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }, 0);

    setSelectedCustomerId(null);
  };

  // 🟢 Thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🟢 Gửi cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      message.warning("Vui lòng nhập họ và tên");
      return;
    }
    if (!formData.phone.trim()) {
      message.warning("Vui lòng nhập số điện thoại");
      return;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      message.warning("Số điện thoại không đúng định dạng");
      return;
    }

    try {
      setModalLoading(true);

      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
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
            onClick={() => message.info("Tính năng xoá sẽ thêm sau")}
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
            {loading ? (
              <div className="text-center p-3">Đang tải dữ liệu...</div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <CommonFooter />
      <DeleteModal />

      {/* 🟢 Modal chỉnh sửa khách hàng (giống EditCategory) */}
      <div className="modal fade" id="edit-customer-modal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header border-0 custom-modal-header">
              <div className="page-title">
                <h4>Chỉnh sửa khách hàng</h4>
              </div>
              <button
                type="button"
                className="close"
                onClick={handleModalClose}
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body custom-modal-body">
              {modalLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
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
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Số điện thoại<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Giới tính</label>
                    <select
                      name="gender"
                      className="form-control"
                      value={formData.gender}
                      onChange={handleInputChange}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
