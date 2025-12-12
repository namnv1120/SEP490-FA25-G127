/**
 * ============================================================================
 * ADMIN PORTAL - CẬP NHẬT TIẾNG VIỆT & LOGO
 * ============================================================================
 * 
 * ✅ ĐÃ HOÀN THÀNH
 * -----------------
 * 
 * 1. LOGO SNAPBUY
 *    ✅ Login Page - Thay FaShieldAlt bằng logo SnapBuy
 *    ✅ Sidebar - Thay FaShieldAlt bằng logo SnapBuy
 *    ✅ Logo path: /src/assets/img/logo-white.svg
 * 
 * 2. LOADING COMPONENT
 *    ✅ Tạo AdminLoading.jsx với:
 *       - Logo SnapBuy animation (pulse effect)
 *       - Spinner xoay tròn
 *       - Message tùy chỉnh
 *       - Tông màu xám phù hợp với admin theme
 *    ✅ Tích hợp vào Login page
 *    ✅ Hiển thị khi đăng nhập: "Đang đăng nhập..."
 * 
 * 3. DỊCH TIẾNG VIỆT - ĐÃ HOÀN THÀNH
 *    ✅ Login.jsx - 100%
 *    ✅ AdminSidebar.jsx - 100%
 *    ✅ AdminHeader.jsx - 100%
 *    ✅ Dashboard.jsx - 100%
 *    ✅ ThemeCustomizer.jsx - 100%
 * 
 * ⚠️ CẦN DỊCH TIẾNG VIỆT
 * -----------------------
 * 
 * Các file sau vẫn còn tiếng Anh, cần dịch:
 * 
 * 1. StoreManagement.jsx
 *    - "Store Management" → "Quản Lý Cửa Hàng"
 *    - "Manage all tenant stores..." → "Quản lý tất cả cửa hàng..."
 *    - "Add New Store" → "Thêm Cửa Hàng Mới"
 *    - "Search by name, domain, or owner..." → "Tìm kiếm theo tên, tên miền hoặc chủ..."
 *    - "All Status" → "Tất Cả Trạng Thái"
 *    - "Active" → "Hoạt Động"
 *    - "Pending" → "Chờ Duyệt"
 *    - "Inactive" → "Ngừng Hoạt Động"
 *    - "Total Stores" → "Tổng Số Cửa Hàng"
 *    - "Active Stores" → "Cửa Hàng Hoạt Động"
 *    - "Total Users" → "Tổng Người Dùng"
 *    - "Total Revenue" → "Tổng Doanh Thu"
 *    - "All Stores" → "Tất Cả Cửa Hàng"
 *    - "Store Info" → "Thông Tin Cửa Hàng"
 *    - "Owner" → "Chủ Sở Hữu"
 *    - "Contact" → "Liên Hệ"
 *    - "Plan" → "Gói Dịch Vụ"
 *    - "Status" → "Trạng Thái"
 *    - "Users" → "Người Dùng"
 *    - "Products" → "Sản Phẩm"
 *    - "Revenue" → "Doanh Thu"
 *    - "Actions" → "Hành Động"
 *    - "View Details" → "Xem Chi Tiết"
 *    - "Edit Store" → "Sửa Cửa Hàng"
 *    - "Delete Store" → "Xóa Cửa Hàng"
 *    - "No stores found" → "Không tìm thấy cửa hàng"
 *    - "Are you sure you want to delete this store?" → "Bạn có chắc muốn xóa cửa hàng này?"
 *    - "Form will be implemented here" → "Form sẽ được triển khai tại đây"
 *    - "Close" → "Đóng"
 * 
 * 2. RoleManagement.jsx
 *    - "Role Management" → "Quản Lý Vai Trò"
 *    - "Manage user roles and permissions..." → "Quản lý vai trò và quyền hạn..."
 *    - "Create New Role" → "Tạo Vai Trò Mới"
 *    - "Search roles by name or description..." → "Tìm kiếm vai trò theo tên hoặc mô tả..."
 *    - "Total Roles" → "Tổng Số Vai Trò"
 *    - "Permissions" → "Quyền Hạn"
 *    - "Description" → "Mô tả"
 *    - "Created" → "Ngày Tạo"
 *    - "No roles found" → "Không tìm thấy vai trò"
 * 
 * 3. AccountManagement.jsx
 *    - "Account Management" → "Quản Lý Tài Khoản"
 *    - "Manage user accounts across all stores" → "Quản lý tài khoản người dùng..."
 *    - "Add New Account" → "Thêm Tài Khoản Mới"
 *    - "Search by name, email, or store..." → "Tìm kiếm theo tên, email hoặc cửa hàng..."
 *    - "All Roles" → "Tất Cả Vai Trò"
 *    - "Total Accounts" → "Tổng Số Tài Khoản"
 *    - "Suspended" → "Tạm Ngưng"
 *    - "All Accounts" → "Tất Cả Tài Khoản"
 *    - "User Info" → "Thông Tin Người Dùng"
 *    - "Role" → "Vai Trò"
 *    - "Store" → "Cửa Hàng"
 *    - "Last Login" → "Đăng Nhập Lần Cuối"
 *    - "View Details" → "Xem Chi Tiết"
 *    - "Edit Account" → "Sửa Tài Khoản"
 *    - "Delete Account" → "Xóa Tài Khoản"
 *    - "No accounts found" → "Không tìm thấy tài khoản"
 * 
 * 4. SystemSettings.jsx
 *    - "System Settings" → "Cài Đặt Hệ Thống"
 *    - "Configure global system settings..." → "Cấu hình cài đặt hệ thống..."
 *    - "Save Changes" → "Lưu Thay Đổi"
 *    - "General Settings" → "Cài Đặt Chung"
 *    - "Security Settings" → "Cài Đặt Bảo Mật"
 *    - "Notification Settings" → "Cài Đặt Thông Báo"
 *    - "Database & Backup" → "Cơ Sở Dữ Liệu & Sao Lưu"
 *    - "Site Name" → "Tên Trang"
 *    - "Site URL" → "Địa Chỉ Trang"
 *    - "Support Email" → "Email Hỗ Trợ"
 *    - "Maximum Stores" → "Số Cửa Hàng Tối Đa"
 *    - "Session Timeout (minutes)" → "Thời Gian Hết Phiên (phút)"
 *    - "Password Minimum Length" → "Độ Dài Mật Khẩu Tối Thiểu"
 *    - "Require Two-Factor Authentication" → "Yêu Cầu Xác Thực Hai Yếu Tố"
 *    - "Enable Maintenance Mode" → "Bật Chế Độ Bảo Trì"
 *    - "Enable System Notifications" → "Bật Thông Báo Hệ Thống"
 *    - "Allow New Store Registration" → "Cho Phép Đăng Ký Cửa Hàng Mới"
 *    - "Email notifications will be sent to:" → "Thông báo email sẽ được gửi đến:"
 *    - "Enable Automatic Backup" → "Bật Tự Động Sao Lưu"
 *    - "Backup Frequency" → "Tần Suất Sao Lưu"
 *    - "Hourly" → "Mỗi Giờ"
 *    - "Daily" → "Hàng Ngày"
 *    - "Weekly" → "Hàng Tuần"
 *    - "Monthly" → "Hàng Tháng"
 *    - "Backup Now" → "Sao Lưu Ngay"
 *    - "Restore" → "Khôi Phục"
 *    - "Reset to Default" → "Đặt Lại Mặc Định"
 *    - "Save All Changes" → "Lưu Tất Cả Thay Đổi"
 * 
 * 5. AdminRouter.jsx (Placeholder pages)
 *    - "Analytics" → "Phân Tích"
 *    - "Analytics page will be implemented here" → "Trang phân tích sẽ được triển khai tại đây"
 *    - "Database Management" → "Quản Lý Cơ Sở Dữ Liệu"
 *    - "Database management page..." → "Trang quản lý cơ sở dữ liệu..."
 *    - "Notifications" → "Thông Báo"
 *    - "Notifications page..." → "Trang thông báo..."
 *    - "System Logs" → "Nhật Ký Hệ Thống"
 *    - "System logs page..." → "Trang nhật ký hệ thống..."
 *    - "Admin Profile" → "Hồ Sơ Quản Trị"
 *    - "Profile page..." → "Trang hồ sơ..."
 * 
 * ============================================================================
 * HƯỚNG DẪN SỬ DỤNG LOADING
 * ============================================================================
 * 
 * Import:
 * import AdminLoading from '../components/AdminLoading';
 * 
 * Sử dụng:
 * {loading && <AdminLoading message="Đang tải..." />}
 * 
 * Các message gợi ý:
 * - "Đang đăng nhập..."
 * - "Đang tải dữ liệu..."
 * - "Đang xử lý..."
 * - "Đang lưu..."
 * - "Đang xóa..."
 * 
 * ============================================================================
 * GHI CHÚ
 * ============================================================================
 * 
 * - Logo SnapBuy đã được thay thế ở Login và Sidebar
 * - Loading component đã được tạo với animation đẹp
 * - Cần dịch tiếp 4 file còn lại: StoreManagement, RoleManagement, 
 *   AccountManagement, SystemSettings
 * - Tất cả placeholder pages trong AdminRouter cũng cần dịch
 * 
 * Status: 🔄 ĐANG TIẾN HÀNH
 * Next: Dịch các file còn lại
 * 
 * ============================================================================
 */

export default {};
