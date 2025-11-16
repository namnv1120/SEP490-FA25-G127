import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import { message } from "antd";
import { getPosSettings, updatePosSettings } from "../../services/PosSettingsService";

const PosSystemSettings = () => {
  const [formData, setFormData] = useState({
    taxPercent: 0,
    discountPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    // Giới hạn giá trị từ 0 đến 100
    const clampedValue = Math.max(0, Math.min(100, value));
    setFormData((prev) => ({
      ...prev,
      [field]: clampedValue,
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

    try {
      setSaving(true);
      await updatePosSettings({
        taxPercent: formData.taxPercent,
        discountPercent: formData.discountPercent,
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
      setFormData({
        taxPercent: settings.taxPercent || 0,
        discountPercent: settings.discountPercent || 0,
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
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </div>
                    ) : (
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
                                type="number"
                                className="form-control"
                                value={formData.taxPercent}
                                onChange={handleInputChange("taxPercent")}
                                min="0"
                                max="100"
                                step="0.01"
                                required
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
                                type="number"
                                className="form-control"
                                value={formData.discountPercent}
                                onChange={handleInputChange("discountPercent")}
                                min="0"
                                max="100"
                                step="0.01"
                                required
                                disabled={saving}
                                placeholder="0.00"
                              />
                              <span className="input-group-text">%</span>
                            </div>
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CommonFooter />
      </div>
    </>
  );
};

export default PosSystemSettings;

