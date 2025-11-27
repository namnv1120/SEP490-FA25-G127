import { useState, useEffect, useMemo } from "react";
import { Modal as AntdModal, message, Spin } from "antd";
import PrimeDataTable from "../../components/data-table";
import TableTopHead from "../../components/table-top-head";
import DeleteModal from "../../components/delete-modal";
import CommonFooter from "../../components/footer/CommonFooter";
import CommonSelect from "../../components/select/common-select";

import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
} from "../../services/CustomerService";

const Customers = () => {
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listData, setListData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  const StatusOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: true, label: "Hoạt động" },
      { value: false, label: "Không hoạt động" },
    ],
    []
  );

  const GenderOptions = useMemo(
    () => [
      { value: null, label: "Tất cả" },
      { value: "Male", label: "Nam" },
      { value: "Female", label: "Nữ" },
      { value: "Other", label: "Khác" },
    ],
    []
  );

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setListData(data);
      setTotalRecords(data.length || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Không thể tải danh sách khách hàng. Vui lòng thử lại.");
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
    } catch {
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

    if (
      !trimmedFullName ||
      trimmedFullName.length < 2 ||
      trimmedFullName.length > 50
    ) {
      message.error("Họ và tên phải từ 2 đến 50 ký tự");
      return;
    }

    try {
      setModalLoading(true);

      const trimmedPhone = formData.phone?.trim() || "";

      // Validate phone if provided
      if (trimmedPhone && !/^\+?[0-9]{10,15}$/.test(trimmedPhone)) {
        message.error(
          "Số điện thoại không đúng định dạng. Vui lòng nhập 10-15 chữ số."
        );
        return;
      }

      const updateData = {
        fullName: trimmedFullName,
        phone: trimmedPhone || null,
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

  const handleToggleStatus = async (customer) => {
    try {
      await toggleCustomerStatus(customer.customerId);
      await fetchCustomers();
      message.success("Đã cập nhật trạng thái khách hàng thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi chuyển đổi trạng thái khách hàng:", err);
      message.error("Lỗi khi chuyển đổi trạng thái. Vui lòng thử lại.");
    }
  };

  const filteredList = listData.filter((item) => {
    // Hide default customer
    if (
      item.customerCode === "CUS000" ||
      item.fullName === "Khách lẻ" ||
      item.customerId === "00000000-0000-0000-0000-000000000001"
    ) {
      return false;
    }

    // Filter theo search query
    if (searchQuery) {
      const matchesSearch =
        item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Filter theo giới tính
    if (genderFilter) {
      const itemGender = (item.gender || "").toLowerCase();
      const filterGender = genderFilter.toLowerCase();

      // Map các giá trị khác nhau về cùng format để so sánh
      const normalizeGender = (gender) => {
        if (gender === "male" || gender === "m") return "male";
        if (gender === "female" || gender === "f") return "female";
        return gender;
      };

      if (normalizeGender(itemGender) !== normalizeGender(filterGender)) {
        return false;
      }
    }

    // Filter theo trạng thái
    if (statusFilter !== null) {
      const isActive = item.active !== false; // Treat null/undefined as true
      if (isActive !== statusFilter) {
        return false;
      }
    }

    return true;
  });

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
  }, [listData, currentPage]);

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
          <input type="checkbox" data-id={data.customerId} />
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
            {new Intl.NumberFormat("vi-VN").format(points)} điểm
          </span>
        );
      },
    },
    {
      header: "Trạng thái",
      field: "status",
      key: "status",
      sortable: true,
      body: (data) => {
        const isActive = data.active !== false; // Treat null/undefined as true
        return (
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge fw-medium fs-10 ${
                isActive ? "bg-success" : "bg-danger"
              }`}
            >
              {isActive ? "Hoạt động" : "Không hoạt động"}
            </span>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={isActive}
                onChange={() => handleToggleStatus(data)}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
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
              setDeleteModalOpen(true);
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
          <TableTopHead
            showExcel={false}
            onRefresh={(e) => {
              if (e) e.preventDefault();
              fetchCustomers();
              message.success("Đã làm mới danh sách khách hàng!");
            }}
          />
        </div>

        <div className="card table-list-card no-search shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap bg-light-subtle px-4 py-3">
            <h5 className="mb-0 fw-semibold">
              Danh sách khách hàng{" "}
              <span className="text-muted small">
                ({filteredList.length} bản ghi)
              </span>
            </h5>
            <div className="d-flex gap-2 align-items-end flex-wrap">
              <div style={{ minWidth: "250px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên, mã KH, số điện thoại..."
                  value={searchQuery}
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
              {/* <div style={{ minWidth: "180px" }}>
                <CommonSelect
                  options={GenderOptions}
                  value={
                    GenderOptions.find((o) => o.value === genderFilter) ||
                    GenderOptions[0]
                  }
                  onChange={(s) => {
                    const v = s?.value;
                    setGenderFilter(v || null);
                    setCurrentPage(1);
                  }}
                  placeholder="Chọn giới tính"
                  className="w-100"
                />
              </div> */}
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
                  data={filteredList}
                  rows={rows}
                  setRows={setRows}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={filteredList.length}
                  dataKey="customerId"
                  loading={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CommonFooter />
      <DeleteModal
        open={deleteModalOpen}
        itemId={customerToDelete?.customerId}
        itemName={customerToDelete?.fullName}
        onDelete={async (id) => {
          try {
            await import("../../services/CustomerService").then(
              ({ deleteCustomer }) => deleteCustomer(id)
            );
            await fetchCustomers();
            message.success("Xoá khách hàng thành công!");
            setDeleteModalOpen(false);
            setCustomerToDelete(null);
          } catch {
            message.error("Lỗi khi xoá khách hàng. Vui lòng thử lại.");
          }
        }}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
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
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={modalLoading}
                placeholder="Nhập số điện thoại (10-15 chữ số)"
              />
              <small className="text-muted">
                Định dạng: 10-15 chữ số, có thể bắt đầu bằng dấu +
              </small>
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
