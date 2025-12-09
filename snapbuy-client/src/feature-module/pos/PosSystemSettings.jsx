import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import { message } from "antd";
import { getPosSettings, updatePosSettings } from "../../services/PosSettingsService";
import PageLoader from "../../components/loading/PageLoader.jsx";

const PosSystemSettings = () => {
  const [formData, setFormData] = useState({
    taxPercent: 0,
    discountPercent: 0,
    loyaltyPointsPercent: 0,
  });
  const [inputValues, setInputValues] = useState({
    taxPercent: "0",
    discountPercent: "0",
    loyaltyPointsPercent: "0",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;

    // Cho phép xóa hết hoặc nhập số
    if (value === "" || value === "-") {
      setInputValues((prev) => ({
        ...prev,
        [field]: value,
      }));
      return;
    }

    // Kiểm tra nếu là số hợp lệ
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setInputValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleInputBlur = (field) => () => {
    const value = inputValues[field];

    // Nếu trống hoặc không hợp lệ, set về 0
    if (value === "" || value === "-" || isNaN(parseFloat(value))) {
      setFormData((prev) => ({
        ...prev,
        [field]: 0,
      }));
      setInputValues((prev) => ({
        ...prev,
        [field]: "0",
      }));
      return;
    }

    // Giới hạn giá trị từ 0 đến 100
    const numValue = parseFloat(value);
    const clampedValue = Math.max(0, Math.min(100, numValue));

    setFormData((prev) => ({
      ...prev,
      [field]: clampedValue,
    }));
    setInputValues((prev) => ({
      ...prev,
      [field]: clampedValue.toString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.taxPercent < 0 || formData.taxPercent > 100) {
      message.error("Phần trăm thuế phải trong khoảng 0-100");
      return;
    }

    if (formData.discountPercent < 0 || formData.discountPercent > 100) {
      message.error("Phần trăm chiết khấu phải trong khoảng 0-100");
      return;
    }

    if (formData.loyaltyPointsPercent < 0 || formData.loyaltyPointsPercent > 100) {
      message.error("Phần trăm điểm tích lũy phải trong khoảng 0-100");
      return;
    }

    try {
      setSaving(true);
      await updatePosSettings({
        taxPercent: formData.taxPercent,
        discountPercent: formData.discountPercent,
        loyaltyPointsPercent: formData.loyaltyPointsPercent,
      });
      message.success("Cập nhật cài đặt thành công!");
      // Reload settings
      await fetchSettings();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật cài đặt"
      );
    } finally {
      setSaving(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getPosSettings();
      const newFormData = {
        taxPercent: settings.taxPercent || 0,
        discountPercent: settings.discountPercent || 0,
        loyaltyPointsPercent: settings.loyaltyPointsPercent || 0,
      };
      setFormData(newFormData);
      setInputValues({
        taxPercent: (settings.taxPercent || 0).toString(),
        discountPercent: (settings.discountPercent || 0).toString(),
        loyaltyPointsPercent: (settings.loyaltyPointsPercent || 0).toString(),
      });
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Không thể tải cài đặt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    isLoading ? (
      <PageLoader />
    ) : (
      <>
        <div className="page-wrapper">
          <div className="content settings-content">
            <div className="page-header">
              <div className="add-item d-flex">
                <div className="page-title">
                  <h4 className="fw-bold">Cài đặt hệ thống POS</h4>
                  <h6>Quản lý cài đặt thuế và chiết khấu cho hệ thống POS</h6>
                </div>
              </div>
              <ul className="table-top-head">
                <RefreshIcon />
                <CollapesIcon />
              </ul>
            </div>
            <div className="row">
              <div className="col-xl-12">
                <div className="settings-wrapper d-flex">
                  <SettingsSideBar />
                  <div className="card flex-fill mb-0">
                    <div className="card-header">
                      <h4 className="fs-18 fw-bold">Cài đặt hệ thống</h4>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="card-title-head mb-4">
                          <h6 className="fs-16 fw-bold mb-1">
                            <span className="fs-16 me-2">
                              <i className="ti ti-settings" />
                            </span>
                            Cấu hình POS
                          </h6>
                          <p className="text-muted mb-0">
                            Các cài đặt này sẽ được áp dụng cho tất cả các đơn hàng trong hệ thống POS
                          </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', width: '30%' }}>
                          <div className="mb-3">
                            <label className="form-label">
                              Phần trăm thuế (%) <span className="text-danger"></span>
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={inputValues.taxPercent}
                                onChange={handleInputChange("taxPercent")}
                                onBlur={handleInputBlur("taxPercent")}
                                disabled={saving}
                                placeholder="0.00"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              Phần trăm chiết khấu (%) <span className="text-danger"></span>
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={inputValues.discountPercent}
                                onChange={handleInputChange("discountPercent")}
                                onBlur={handleInputBlur("discountPercent")}
                                disabled={saving}
                                placeholder="0.00"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              Phần trăm điểm tích lũy (%) <span className="text-danger"></span>
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={inputValues.loyaltyPointsPercent}
                                onChange={handleInputChange("loyaltyPointsPercent")}
                                onBlur={handleInputBlur("loyaltyPointsPercent")}
                                disabled={saving}
                                placeholder="0.00"
                              />
                              <span className="input-group-text">%</span>
                            </div>
                            <small className="text-muted">
                              Ví dụ: 0.20% = 1 điểm cho mỗi 500đ, 5% = 50 điểm cho mỗi 1.000đ. Để 0% nếu không muốn tích điểm.
                            </small>
                          </div>
                        </div>

                        <div className="alert alert-info mt-4">
                          <i className="ti ti-info-circle me-2" />
                          <strong>Lưu ý:</strong> Các thay đổi sẽ được áp dụng ngay lập tức cho các đơn hàng mới.
                          Các đơn hàng đã tạo sẽ không bị ảnh hưởng.
                        </div>

                        <div className="text-end settings-bottom-btn mt-4">
                          <Link to="/pos" className="btn btn-secondary me-2" disabled={saving}>
                            Quay lại POS
                          </Link>
                          <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu cài đặt"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CommonFooter />
        </div>
      </>
    )
  );
};

export default PosSystemSettings;
