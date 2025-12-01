import { useEffect, useRef, useCallback } from "react";
import { notification as antNotification } from "antd";
import { getAllNotifications } from "../../services/NotificationService";
import "../../assets/scss/components/compact-notification.scss";

/**
 * NotificationAlert component - shows a single summary toast for new notifications
 * No individual popups - just a clean summary notification
 */
const NotificationAlert = () => {
    const previousUnreadCount = useRef(0);
    const isInitialLoad = useRef(true);

    // Show summary toast notification
    const showSummaryNotification = useCallback((newCount) => {
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const message = newCount === 1
            ? "Bạn vừa có 1 thông báo mới"
            : `Bạn vừa có ${newCount} thông báo mới`;

        const description = `Nhận lúc ${timeString}`;

        antNotification.open({
            message,
            description,
            duration: 6,
            placement: 'bottomRight',
            className: 'notification-summary',
            icon: (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: '#1f2937' }}
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            ),
            onClick: () => {
                window.location.href = '/notifications';
            },
        });
    }, []);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        try {
            // Get all unread notifications
            const response = await getAllNotifications({ isRead: false, size: 100 });

            // Parse response
            let unreadNotifications = [];
            if (response?.result?.content) {
                unreadNotifications = response.result.content;
            } else if (Array.isArray(response?.result)) {
                unreadNotifications = response.result;
            } else if (response?.content) {
                unreadNotifications = response.content;
            }

            const currentUnreadCount = unreadNotifications.length;

            console.log('[NotificationAlert] Unread count:', currentUnreadCount, 'Previous:', previousUnreadCount.current);

            // Check if there are new notifications
            if (!isInitialLoad.current && currentUnreadCount > previousUnreadCount.current) {
                const newNotificationsCount = currentUnreadCount - previousUnreadCount.current;
                console.log('[NotificationAlert] New notifications detected:', newNotificationsCount);
                showSummaryNotification(newNotificationsCount);
            }

            // Update previous count
            previousUnreadCount.current = currentUnreadCount;

            // Mark initial load as complete
            if (isInitialLoad.current) {
                console.log('[NotificationAlert] Initial load complete');
                isInitialLoad.current = false;
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, [showSummaryNotification]);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("authToken");
        if (!token) return;

        let intervalId;
        let currentInterval = 5000; // Start with 5 seconds for faster detection
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
        window.addEventListener('mousemove', handleUserActivity, { once: true, passive: true });
        window.addEventListener('keydown', handleUserActivity, { once: true, passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start polling
        startPolling();

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchNotifications]);

    // This component doesn't render anything visible - just handles background notifications
    return null;
};

export default NotificationAlert;
