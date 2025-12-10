import { useState, useEffect, useCallback } from "react";
import { Modal, message, Spin, Select } from "antd";
import {
  getSupplierById,
  updateSupplier,
} from "../../../services/SupplierService";
import {
  getProvinces,
  getWardsByProvince,
} from "../../../services/LocationService";

const EditSupplier = ({ isOpen, supplierId, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierCode: "",
    supplierName: "",
    email: "",
    phone: "",
    address: "",
    ward: "",
    city: "",
    active: true,
  });
  const [errors, setErrors] = useState({});

  // State cho dropdown địa phương
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const loadSupplierData = useCallback(async () => {
    try {
      setLoading(true);
      const supplier = await getSupplierById(supplierId);

      setFormData({
        supplierCode: supplier.supplierCode || "",
        supplierName: supplier.supplierName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        ward: supplier.ward || "",
        city: supplier.city || "",
        active: supplier.active === 1 || supplier.active === true,
      });

      // Load provinces và wards nếu có city
      if (supplier.city) {
        await loadProvincesAndWards(supplier.city, supplier.ward);
      }
    } catch {
      message.error("Không thể tải dữ liệu nhà cung cấp");
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  }, [supplierId, onClose]);

  useEffect(() => {
    if (isOpen && supplierId) {
      loadProvinces();
      loadSupplierData();
    }
  }, [isOpen, supplierId, loadSupplierData]);

  // Load danh sách tỉnh/thành phố
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data || []);
    } catch {
      message.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load danh sách xã/phường khi chọn tỉnh
  const loadWards = async (provinceCode) => {
    try {
      setLoadingWards(true);
      const data = await getWardsByProvince(provinceCode);
      setWards(data || []);
    } catch {
      message.error("Không thể tải danh sách xã/phường");
    } finally {
      setLoadingWards(false);
    }
  };

  // Load provinces và wards khi edit (tìm province code từ tên city)
  const loadProvincesAndWards = async (cityName) => {
    try {
      const provincesData = await getProvinces();
      setProvinces(provincesData || []);

      const normalize = (str) => (str || "").trim().toLowerCase();

      // Tìm province code từ tên (dùng so khớp mềm để tránh lệch tên)
      let province =
        provincesData.find((p) => normalize(p.name) === normalize(cityName)) ||
        provincesData.find((p) =>
          normalize(cityName).includes(normalize(p.name))
        ) ||
        provincesData.find((p) =>
          normalize(p.name).includes(normalize(cityName))
        );

      if (province) {
        setSelectedProvinceCode(province.code);
        const wardsData = await getWardsByProvince(province.code);
        setWards(wardsData || []);
      } else {
        // Không tìm thấy province tương ứng: giữ nguyên city/ward text nhưng không disable select
        setSelectedProvinceCode(null);
        setWards([]);
      }
    } catch (error) {
      console.error("Error loading location data:", error);
    }
  };

  // 🧩 Validate dữ liệu
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierCode.trim()) {
      newErrors.supplierCode = "Vui lòng nhập mã nhà cung cấp.";
    } else if (formData.supplierCode.length > 20) {
      newErrors.supplierCode = "Mã nhà cung cấp không được vượt quá 20 ký tự.";
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = "Vui lòng nhập tên nhà cung cấp.";
    } else if (formData.supplierName.length > 100) {
      newErrors.supplierName =
        "Tên nhà cung cấp không được vượt quá 100 ký tự.";
    }

    if (formData.email && formData.email.length > 100) {
      newErrors.email = "Email không được vượt quá 100 ký tự.";
    } else if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Email không đúng định dạng. Vui lòng kiểm tra lại.";
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = "Số điện thoại không được vượt quá 20 ký tự.";
    } else if (
      formData.phone &&
      !/^[0-9+\-()\s]{10,20}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Số điện thoại không đúng định dạng. Vui lòng nhập 10-20 chữ số.";
    }

    if (formData.address && formData.address.length > 100) {
      newErrors.address = "Địa chỉ không được vượt quá 100 ký tự.";
    }

    if (formData.city && formData.city.length > 50) {
      newErrors.city = "Thành phố không được vượt quá 50 ký tự.";
    }

    if (formData.ward && formData.ward.length > 50) {
      newErrors.ward = "Phường/Xã không được vượt quá 50 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = (value, option) => {
    // Khi clear (value = null/undefined), reset city & ward
    if (!value) {
      setSelectedProvinceCode(null);
      setWards([]);
      setFormData((prev) => ({ ...prev, city: "", ward: "" }));
      setErrors((prev) => ({ ...prev, city: "", ward: "" }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      city: option?.label || "",
      ward: "",
    }));
    setSelectedProvinceCode(value);
    setWards([]);
    setErrors((prev) => ({ ...prev, city: "", ward: "" }));

    loadWards(value);
  };

  // Xử lý khi chọn xã/phường
  const handleWardChange = (value, option) => {
    // Khi clear (value = null/undefined), reset ward
    if (!value) {
      setFormData((prev) => ({ ...prev, ward: "" }));
      setErrors((prev) => ({ ...prev, ward: "" }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ward: option?.label || "",
    }));
    setErrors((prev) => ({ ...prev, ward: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.warning("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        supplierCode: formData.supplierCode,
        supplierName: formData.supplierName,
        email: formData.email,
        phone: formData.phone || "",
        address: formData.address,
        ward: formData.ward || "",
        city: formData.city || "",
        active: formData.active === true,
      };

      await updateSupplier(supplierId, submitData);
      message.success("Cập nhật nhà cung cấp thành công!");

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật nhà cung cấp";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!supplierId) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      footer={null}
      width={800}
      closable={true}
      title={
        <div>
          <h4 className="mb-0">Cập nhật nhà cung cấp</h4>
        </div>
      }
    >
      {loading && !formData.supplierCode ? (
        <div className="d-flex justify-content-center p-4">
          <Spin size="large" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Mã nhà cung cấp <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="supplierCode"
                  className={`form-control ${
                    errors.supplierCode ? "is-invalid" : ""
                  }`}
                  value={formData.supplierCode}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.supplierCode && (
                  <div className="invalid-feedback">{errors.supplierCode}</div>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Tên nhà cung cấp <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="supplierName"
                  className={`form-control ${
                    errors.supplierName ? "is-invalid" : ""
                  }`}
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.supplierName && (
                  <div className="invalid-feedback">{errors.supplierName}</div>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Email <span className="text-danger"></span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">
                  Số điện thoại <span className="text-danger"></span>
                </label>
                <input
                  type="text"
                  name="phone"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>
            </div>

            {/* Thành phố */}
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Thành phố</label>
                <Select
                  showSearch
                  placeholder="Chọn tỉnh/thành phố"
                  value={selectedProvinceCode}
                  onChange={handleProvinceChange}
                  loading={loadingProvinces}
                  disabled={loading || loadingProvinces}
                  style={{ width: "100%" }}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={provinces.map((province) => ({
                    value: province.code,
                    label: province.name,
                  }))}
                  allowClear
                  onClear={() => {
                    setSelectedProvinceCode(null);
                    setWards([]);
                    setFormData((prev) => ({ ...prev, city: "", ward: "" }));
                  }}
                />
                {errors.city && (
                  <div
                    className="text-danger mt-1"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {errors.city}
                  </div>
                )}
              </div>
            </div>

            {/* Xã/Phường */}
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Xã/Phường</label>
                <Select
                  showSearch
                  placeholder="Chọn xã/phường"
                  value={formData.ward || undefined}
                  onChange={handleWardChange}
                  loading={loadingWards}
                  disabled={loading || !selectedProvinceCode || loadingWards}
                  style={{ width: "100%" }}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={wards.map((ward) => ({
                    value: ward.name,
                    label: ward.name,
                  }))}
                  allowClear
                  onClear={() => {
                    setFormData((prev) => ({ ...prev, ward: "" }));
                  }}
                />
                {errors.ward && (
                  <div
                    className="text-danger mt-1"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {errors.ward}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-12">
              <div className="mb-3">
                <label className="form-label">
                  Địa chỉ <span className="text-danger"></span>
                </label>
                <input
                  type="text"
                  name="address"
                  className={`form-control ${
                    errors.address ? "is-invalid" : ""
                  }`}
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer-btn mt-4 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-cancel me-2"
              onClick={onClose}
              disabled={loading}
            >
              Huỷ
            </button>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditSupplier;
