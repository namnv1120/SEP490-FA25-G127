import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RefreshIcon from "../../components/tooltip-content/refresh";
import CollapesIcon from "../../components/tooltip-content/collapes";
import CommonFooter from "../../components/footer/CommonFooter";
import SettingsSideBar from "../../feature-module/settings/SettingsSideBar";
import { message } from "antd";
import { getNotificationSettings, updateNotificationSettings } from "../../services/NotificationSettingsService";
import PageLoader from "../../components/loading/PageLoader.jsx";

const NotificationSettings = () => {
  const [formData, setFormData] = useState({
    lowStockEnabled: true,
    promotionEnabled: true,
    purchaseOrderEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getNotificationSettings();
      setFormData({
        lowStockEnabled: settings.lowStockEnabled !== undefined ? settings.lowStockEnabled : true,
        promotionEnabled: settings.promotionEnabled !== undefined ? settings.promotionEnabled : true,
        purchaseOrderEnabled: settings.purchaseOrderEnabled !== undefined ? settings.purchaseOrderEnabled : true,
      });
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Không thể tải cài đặt thông báo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateNotificationSettings({
        lowStockEnabled: formData.lowStockEnabled,
        promotionEnabled: formData.promotionEnabled,
        purchaseOrderEnabled: formData.purchaseOrderEnabled,
      });
      message.success("Cập nhật cài đặt thông báo thành công!");
    } catch (error) {
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật cài đặt thông báo"
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content settings-content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4 className="fw-bold">Cài đặt</h4>
                <h6>Quản lý cài đặt phần mềm</h6>
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
                    <h4 className="fs-18 fw-bold">Thông báo</h4>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="card-title-head">
                        <h6 className="fs-16 fw-bold mb-1">
                          <span className="fs-16 me-2">
                            <i className="ti ti-bell" />
                          </span>
                          Cài đặt thông báo
                        </h6>
                        <p className="text-muted mb-4">
                          Bật/tắt các loại thông báo bạn muốn nhận. Khi tắt, bạn sẽ không nhận được thông báo loại đó nữa.
                        </p>
                      </div>

                      {/* Tồn kho thấp */}
                      <div className="mb-4 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              <i className="ti ti-package me-2"></i>
                              Thông báo tồn kho thấp
                            </h6>
                            <p className="text-muted mb-0 small">
                              Nhận thông báo khi sản phẩm có số lượng tồn kho thấp hoặc hết hàng
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="lowStockToggle"
                              checked={formData.lowStockEnabled}
                              onChange={() => handleToggle("lowStockEnabled")}
                              disabled={saving}
                            />
                            <label className="form-check-label" htmlFor="lowStockToggle">
                              {formData.lowStockEnabled ? "Bật" : "Tắt"}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Khuyến mãi */}
                      <div className="mb-4 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              <i className="ti ti-discount-2 me-2"></i>
                              Thông báo khuyến mãi
                            </h6>
                            <p className="text-muted mb-0 small">
                              Nhận thông báo khi khuyến mãi sắp hết hạn hoặc đã hết hạn
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="promotionToggle"
                              checked={formData.promotionEnabled}
                              onChange={() => handleToggle("promotionEnabled")}
                              disabled={saving}
                            />
                            <label className="form-check-label" htmlFor="promotionToggle">
                              {formData.promotionEnabled ? "Bật" : "Tắt"}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Đơn nhập kho */}
                      <div className="mb-4 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              <i className="ti ti-truck-delivery me-2"></i>
                              Thông báo đơn nhập kho
                            </h6>
                            <p className="text-muted mb-0 small">
                              Nhận thông báo về trạng thái đơn đặt hàng (chờ duyệt, đã duyệt, hoàn tất, v.v.)
                            </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="purchaseOrderToggle"
                              checked={formData.purchaseOrderEnabled}
                              onChange={() => handleToggle("purchaseOrderEnabled")}
                              disabled={saving}
                            />
                            <label className="form-check-label" htmlFor="purchaseOrderToggle">
                              {formData.purchaseOrderEnabled ? "Bật" : "Tắt"}
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="text-end settings-bottom-btn mt-4">
                        <button type="button" className="btn btn-secondary me-2" disabled={saving}>
                          Huỷ
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
  );
};

export default NotificationSettings;



