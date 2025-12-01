import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../../services/NotificationService";
import { allRoutes } from "../../routes/AllRoutes";
import CommonFooter from "../../components/footer/CommonFooter";
import "../../assets/scss/pages/notifications.scss";

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
            };

            if (filter === "UNREAD") {
                params.isRead = false;
            } else if (filter !== "ALL" && filter !== "KHUYEN_MAI" && filter !== "DON_NHAP_KHO") {
                // For specific type filters (not grouped ones)
                params.type = filter;
            }
            // For KHUYEN_MAI and DON_NHAP_KHO, we fetch all and filter client-side

            const response = await getAllNotifications(params);

            // Handle API response format
            let data = {};
            if (response?.result) {
                data = response.result;
            } else if (response?.content !== undefined) {
                data = response;
            } else {
                data = { content: [], totalPages: 1 };
            }

            setNotifications(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, currentPage]);

    // Auto-reload when page becomes visible (user navigates back)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Page is visible again, reload notifications
                fetchNotifications();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications(
                notifications.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            // Refresh to get updated count
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
            // Refresh to get updated data
            fetchNotifications();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // Handle delete
    const handleDelete = async (notificationId) => {
        if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
            try {
                await deleteNotification(notificationId);
                setNotifications(notifications.filter((n) => n.id !== notificationId));
                // Refresh to get updated count and list
                fetchNotifications();
            } catch (error) {
                console.error("Error deleting notification:", error);
            }
        }
    };

    // Get notification icon (black/white style)
    const getNotificationIcon = (type) => {
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
            case "DON_DAT_HANG_BI_TU_CHOI":
                return "ti ti-x";
            case "DON_DAT_HANG_BI_HUY":
                return "ti ti-trash";
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
            case "DON_DAT_HANG_BI_TU_CHOI":
            case "DON_DAT_HANG_BI_HUY":
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
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }

        // Điều hướng đến trang liên quan
        const url = getNotificationUrl(notification);
        if (url) {
            // Kiểm tra xem có đang ở trang purchase order không
            const isPurchaseOrderPage = window.location.pathname.includes('/purchase-orders');
            const isPurchaseOrderNotification = [
                'DON_DAT_HANG_CHO_DUYET',
                'DON_DAT_HANG_DA_DUYET',
                'DON_DAT_HANG_CHO_XAC_NHAN',
                'DON_DAT_HANG_HOAN_TAT',
                'DON_DAT_HANG_BI_TU_CHOI',
                'DON_DAT_HANG_BI_HUY'
            ].includes(notification.type);

            // Nếu đang ở trang purchase order và click vào thông báo purchase order
            if (isPurchaseOrderPage && isPurchaseOrderNotification && url === allRoutes.purchaseorders) {
                // Dispatch event để trigger reload dữ liệu
                const event = new CustomEvent('purchaseOrderNotificationClicked', {
                    detail: { notification }
                });
                window.dispatchEvent(event);
                console.log('Dispatched purchaseOrderNotificationClicked event from Notifications page', notification);
                // Navigate back to purchase orders page to trigger reload
                navigate(url);
            } else {
                navigate(url);
            }
        }
    };

    // Format time
    const formatTime = (timestamp) => {
        if (!timestamp) return "Vừa xong";
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now - notifTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return "Hôm qua";
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return notifTime.toLocaleDateString("vi-VN");
    };

    // Get unread count
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Filter notifications based on selected filter
    const filteredNotifications = notifications.filter((n) => {
        if (filter === "ALL") return true;
        if (filter === "UNREAD") return !n.isRead;

        // Group promotion notifications
        if (filter === "KHUYEN_MAI") {
            return n.type === "KHUYEN_MAI_SAP_HET_HAN" || n.type === "KHUYEN_MAI_HET_HAN";
        }

        // Group purchase order notifications
        if (filter === "DON_NHAP_KHO") {
            return n.type.startsWith("DON_DAT_HANG_");
        }

        return n.type === filter;
    });

    return (
        <div className="page-wrapper">
            <div className="content">
                {/* Page Header */}
                <div className="page-header">
                    <div className="page-title">
                        <h4>Thông báo</h4>
                        <h6>Quản lý tất cả thông báo của hệ thống</h6>
                    </div>
                    <div className="page-btn">
                        {unreadCount > 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={handleMarkAllAsRead}
                            >
                                <i className="ti ti-checks me-2"></i>
                                Đánh dấu tất cả đã đọc ({unreadCount})
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="card mb-3">
                    <div className="card-body">
                        <div className="notification-filters">
                            <button
                                className={`filter-btn ${filter === "ALL" ? "active" : ""}`}
                                onClick={() => {
                                    setFilter("ALL");
                                    setCurrentPage(0);
                                }}
                            >
                                <i className="ti ti-list"></i>
                                Tất cả
                            </button>
                            <button
                                className={`filter-btn ${filter === "UNREAD" ? "active" : ""}`}
                                onClick={() => {
                                    setFilter("UNREAD");
                                    setCurrentPage(0);
                                }}
                            >
                                <i className="ti ti-bell-ringing"></i>
                                Chưa đọc
                            </button>
                            <button
                                className={`filter-btn ${filter === "TON_KHO_THAP" ? "active" : ""}`}
                                onClick={() => {
                                    setFilter("TON_KHO_THAP");
                                    setCurrentPage(0);
                                }}
                            >
                                <i className="ti ti-package"></i>
                                Tồn kho thấp
                            </button>
                            <button
                                className={`filter-btn ${filter === "KHUYEN_MAI" ? "active" : ""}`}
                                onClick={() => {
                                    setFilter("KHUYEN_MAI");
                                    setCurrentPage(0);
                                }}
                            >
                                <i className="ti ti-discount-2"></i>
                                Khuyến mãi
                            </button>
                            <button
                                className={`filter-btn ${filter === "DON_NHAP_KHO" ? "active" : ""}`}
                                onClick={() => {
                                    setFilter("DON_NHAP_KHO");
                                    setCurrentPage(0);
                                }}
                            >
                                <i className="ti ti-truck-delivery"></i>
                                Đơn nhập kho
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="card">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" />
                                <p className="mt-3">Đang tải...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="ti ti-bell-off" style={{ fontSize: "64px", color: "#ccc" }}></i>
                                <h5 className="mt-3">Không có thông báo</h5>
                                <p className="text-muted">Bạn không có thông báo nào trong danh mục này</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table notification-table">
                                        <thead>
                                            <tr>
                                                <th width="50"></th>
                                                <th>Thông báo</th>
                                                <th width="150">Thời gian</th>
                                                <th width="100">Trạng thái</th>
                                                <th width="100">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredNotifications.map((notification) => {
                                                const iconClass = getNotificationIcon(notification.type);
                                                const hasLink = getNotificationUrl(notification) !== null;
                                                return (
                                                    <tr
                                                        key={notification.id}
                                                        className={`${!notification.isRead ? "unread" : ""} ${hasLink ? "clickable" : ""}`}
                                                    >
                                                        <td onClick={() => hasLink && handleNotificationClick(notification)}>
                                                            <div className="notification-icon-wrapper">
                                                                {!notification.isRead && (
                                                                    <span className="unread-dot"></span>
                                                                )}
                                                                <div className="notification-icon">
                                                                    <i className={iconClass}></i>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td onClick={() => hasLink && handleNotificationClick(notification)}>
                                                            <h6 className="mb-1">
                                                                {notification.message}
                                                                {hasLink && <i className="ti ti-external-link ms-2" style={{ fontSize: '12px', opacity: 0.5 }}></i>}
                                                            </h6>
                                                            {notification.description && (
                                                                <p className="text-muted mb-0 small">
                                                                    {notification.description}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td onClick={() => hasLink && handleNotificationClick(notification)}>
                                                            <span className="text-muted small">
                                                                {formatTime(notification.createdAt)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {!notification.isRead ? (
                                                                <span className="badge bg-primary">Mới</span>
                                                            ) : (
                                                                <span className="badge bg-secondary">Đã đọc</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button
                                                                    className={`btn btn-sm btn-outline-warning me-1 ${notification.isRead ? 'btn-disabled' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        !notification.isRead && handleMarkAsRead(notification.id);
                                                                    }}
                                                                    title="Đánh dấu đã đọc"
                                                                    disabled={notification.isRead}
                                                                >
                                                                    <i className="ti ti-check"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(notification.id);
                                                                    }}
                                                                    title="Xóa"
                                                                >
                                                                    <i className="ti ti-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <nav>
                                            <ul className="pagination">
                                                <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(currentPage - 1)}
                                                        disabled={currentPage === 0}
                                                    >
                                                        Trước
                                                    </button>
                                                </li>
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <li
                                                        key={index}
                                                        className={`page-item ${index === currentPage ? "active" : ""}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(index)}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li
                                                    className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(currentPage + 1)}
                                                        disabled={currentPage === totalPages - 1}
                                                    >
                                                        Sau
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <CommonFooter />
        </div>
    );
};

export default Notifications;
