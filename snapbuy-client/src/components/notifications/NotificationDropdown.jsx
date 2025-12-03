import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NavDropdown, Badge } from "react-bootstrap";
import { allRoutes } from "../../routes/AllRoutes";
import {
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../services/NotificationService";
import "../../assets/scss/components/notification-dropdown.scss";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const [notifData, countData] = await Promise.all([
        getRecentNotifications(10),
        getUnreadCount(),
      ]);

      // Handle API response format
      let notifList = [];
      if (notifData?.result) {
        // Response wrapped in result object
        if (notifData.result.content) {
          notifList = notifData.result.content;
        } else if (Array.isArray(notifData.result)) {
          notifList = notifData.result;
        }
      } else if (Array.isArray(notifData)) {
        notifList = notifData;
      } else if (notifData?.content) {
        notifList = notifData.content;
      }

      // Handle count response
      let count = 0;
      if (countData?.result !== undefined) {
        count =
          typeof countData.result === "number"
            ? countData.result
            : parseInt(countData.result) || 0;
      } else if (typeof countData === "number") {
        count = countData;
      }

      setNotifications(notifList);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Don't use mock data, just show empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    let intervalId;
    let currentInterval = 5000; // Start with 5 seconds for faster detection (same as NotificationAlert)
    const IDLE_INTERVAL = 30000; // 30 seconds when idle
    const ACTIVE_INTERVAL = 5000; // 5 seconds when active

    // Initial fetch immediately
    fetchNotifications();

    // Smart polling: slower when idle, faster when active
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);

      intervalId = setInterval(() => {
        fetchNotifications();
      }, currentInterval);
    };

    // Listen for user activity to switch to active mode
    const handleUserActivity = () => {
      if (currentInterval !== ACTIVE_INTERVAL) {
        currentInterval = ACTIVE_INTERVAL;
        startPolling(); // Restart with faster interval
      }
    };

    // Listen for visibility change (tab active/inactive)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab inactive - slow down
        currentInterval = IDLE_INTERVAL;
      } else {
        // Tab active - speed up
        currentInterval = ACTIVE_INTERVAL;
      }
      startPolling();
    };

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleUserActivity, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", handleUserActivity, {
      once: true,
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start polling
    startPolling();

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
      // Refresh to get updated data
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      // Refresh to get updated data
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Get icon
  const getIcon = (type) => {
    switch (type) {
      case "TON_KHO_THAP":
        return "ti ti-package";
      case "KHUYEN_MAI_SAP_HET_HAN":
        return "ti ti-discount-2";
      case "KHUYEN_MAI_HET_HAN":
        return "ti ti-alert-circle";
      case "DON_HANG":
        return "ti ti-shopping-cart";
      case "THANH_TOAN":
        return "ti ti-credit-card";
      case "HE_THONG":
        return "ti ti-bell";
      // Đơn đặt hàng (Purchase Order)
      case "DON_DAT_HANG_CHO_DUYET":
        return "ti ti-clock-hour-4";
      case "DON_DAT_HANG_DA_DUYET":
        return "ti ti-circle-check";
      case "DON_DAT_HANG_CHO_XAC_NHAN":
        return "ti ti-clipboard-check";
      case "DON_DAT_HANG_HOAN_TAT":
        return "ti ti-package-import";
      default:
        return "ti ti-bell";
    }
  };

  // Get navigation URL based on notification type
  const getNotificationUrl = (notification) => {
    const { type } = notification;

    switch (type) {
      case "TON_KHO_THAP":
        return allRoutes.inventories;
      case "KHUYEN_MAI_SAP_HET_HAN":
      case "KHUYEN_MAI_HET_HAN":
        return allRoutes.promotions;
      case "DON_DAT_HANG_CHO_DUYET":
      case "DON_DAT_HANG_DA_DUYET":
      case "DON_DAT_HANG_CHO_XAC_NHAN":
      case "DON_DAT_HANG_HOAN_TAT":
        return allRoutes.purchaseorders;
      case "DON_HANG":
        return allRoutes.orderhistory;
      case "THANH_TOAN":
        return allRoutes.transactionhistory;
      default:
        return null;
    }
  };

  // Handle notification click - navigate to related page
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setNotifications(
          notifications.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // Điều hướng đến trang liên quan
    const url = getNotificationUrl(notification);
    if (url) {
      // Kiểm tra xem có đang ở trang purchase order không
      const isPurchaseOrderPage =
        window.location.pathname.includes("/purchase-orders");
      const isPurchaseOrderNotification = [
        "DON_DAT_HANG_CHO_DUYET",
        "DON_DAT_HANG_DA_DUYET",
        "DON_DAT_HANG_CHO_XAC_NHAN",
        "DON_DAT_HANG_HOAN_TAT",
        "DON_DAT_HANG_BI_TU_CHOI",
        "DON_DAT_HANG_BI_HUY",
      ].includes(notification.type);

      // Nếu đang ở trang purchase order và click vào thông báo purchase order
      if (
        isPurchaseOrderPage &&
        isPurchaseOrderNotification &&
        url === allRoutes.purchaseorders
      ) {
        // Dispatch event để trigger reload dữ liệu ngay lập tức
        const event = new CustomEvent("purchaseOrderNotificationClicked", {
          detail: { notification },
          bubbles: true,
          cancelable: true,
        });
        window.dispatchEvent(event);
        console.log(
          "Dispatched purchaseOrderNotificationClicked event",
          notification
        );
        // Không navigate vì đã ở trang purchase order rồi
      } else {
        navigate(url);
      }
    }

    // Đóng dropdown sau khi xử lý
    setShow(false);
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Vừa xong";
    const diffMins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
  };

  return (
    <NavDropdown
      as="li"
      className="nav-item dropdown nav-item-box notification-dropdown"
      show={show}
      onToggle={(isOpen) => setShow(isOpen)}
      title={
        <div className="position-relative">
          <i className="ti ti-bell"></i>
          {unreadCount > 0 && (
            <Badge bg="danger" pill className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      }
      id="notifications-dropdown"
      align="end"
    >
      <div className="notification-wrapper">
        {/* Header */}
        <div className="notification-header">
          <h6 className="mb-0">Thông báo</h6>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-mark-all">
              Đánh dấu tất cả
            </button>
          )}
        </div>

        {/* Body */}
        <div className="notification-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-bell-off"></i>
              <p>Không có thông báo mới</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => {
                const hasLink = getNotificationUrl(notification) !== null;
                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      !notification.isRead ? "unread" : ""
                    } ${hasLink ? "clickable" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      <i className={getIcon(notification.type)}></i>
                    </div>
                    <div className="notification-content">
                      <h6>
                        {notification.message}
                        {hasLink && (
                          <i
                            className="ti ti-external-link ms-1"
                            style={{ fontSize: "10px", opacity: 0.5 }}
                          ></i>
                        )}
                      </h6>
                      {notification.description && (
                        <p>{notification.description}</p>
                      )}
                      <span className="time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notification-footer">
          <Link
            to={allRoutes.notifications}
            className="btn-view-all"
            onClick={() => setShow(false)}
          >
            Xem tất cả thông báo
          </Link>
        </div>
      </div>
    </NavDropdown>
  );
};

export default NotificationDropdown;
