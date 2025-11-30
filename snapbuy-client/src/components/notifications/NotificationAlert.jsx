import { useEffect, useRef, useCallback } from "react";
import { notification as antNotification } from "antd";
import {
    getLowStockNotifications,
    getExpiringPromotionNotifications,
    getExpiredPromotionNotifications,
} from "../../services/NotificationService";
import "../../assets/scss/components/compact-notification.scss";

/**
 * NotificationAlert component - only shows toast notifications for new alerts
 * No popup modal - just background checking and toast notifications
 */
const NotificationAlert = () => {
    const previousNotificationIds = useRef(new Set());
    const isInitialLoad = useRef(true);

    // Helper function to parse notification data
    const parseNotifications = useCallback((data) => {
        if (data?.result) {
            if (data.result.content) {
                return data.result.content;
            } else if (Array.isArray(data.result)) {
                return data.result;
            }
        } else if (Array.isArray(data)) {
            return data;
        } else if (data?.content) {
            return data.content;
        }
        return [];
    }, []);

    // Show toast notification for new notifications
    const showToastNotification = useCallback((newNotifications) => {
        newNotifications.forEach((notif) => {
            const type = notif.type === 'TON_KHO_THAP' ? 'warning'
                : notif.type === 'KHUYEN_MAI_HET_HAN' ? 'error'
                    : 'info';

            // Get icon based on type
            const icon = notif.type === 'TON_KHO_THAP' ? '📦'
                : notif.type === 'KHUYEN_MAI_HET_HAN' ? '⚠️'
                    : notif.type === 'KHUYEN_MAI_SAP_HET_HAN' ? '⏰'
                        : '🔔';

            antNotification[type]({
                message: notif.message,
                description: notif.description,
                duration: 4,
                placement: 'bottomRight',
                style: {
                    width: '340px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                className: 'compact-notification',
                icon: <span style={{ fontSize: '20px' }}>{icon}</span>,
            });
        });
    }, []);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        try {
            const [lowStockData, expiringData, expiredData] = await Promise.all([
                getLowStockNotifications(),
                getExpiringPromotionNotifications(),
                getExpiredPromotionNotifications(),
            ]);

            // Parse all notification types
            let notifList = [
                ...parseNotifications(lowStockData),
                ...parseNotifications(expiringData),
                ...parseNotifications(expiredData),
            ];

            // Filter only unread notifications and remove duplicates by id
            const uniqueNotifMap = new Map();
            notifList.filter((n) => !n.isRead).forEach((n) => {
                uniqueNotifMap.set(n.id, n);
            });
            notifList = Array.from(uniqueNotifMap.values());

            // Check for new notifications (not in previous set)
            const currentIds = new Set(notifList.map(n => n.id));
            const newNotifications = notifList.filter(n => !previousNotificationIds.current.has(n.id));

            // Update previous IDs
            previousNotificationIds.current = currentIds;

            // Only show toast for new notifications (skip initial load)
            if (!isInitialLoad.current && newNotifications.length > 0) {
                showToastNotification(newNotifications);
            }

            // Mark initial load as complete
            if (isInitialLoad.current) {
                isInitialLoad.current = false;
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, [parseNotifications, showToastNotification]);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("authToken");
        if (!token) return;

        let intervalId;
        let currentInterval = 120000; // Start with 2 minutes (idle)
        const IDLE_INTERVAL = 120000; // 2 minutes when idle
        const ACTIVE_INTERVAL = 30000; // 30 seconds when active

        // Initial fetch with delay
        const initialTimer = setTimeout(() => {
            fetchNotifications();
        }, 2000);

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
            clearTimeout(initialTimer);
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

