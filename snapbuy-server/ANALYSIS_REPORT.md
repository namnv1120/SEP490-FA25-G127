# BÁO CÁO PHÂN TÍCH CHỨC NĂNG VÀ VALIDATION

## 📋 TỔNG QUAN HỆ THỐNG

Hệ thống **SnapBuy Server** là một hệ thống quản lý bán hàng (POS - Point of Sale) với các module chính:
- Quản lý tài khoản và phân quyền
- Quản lý sản phẩm và danh mục
- Quản lý khách hàng
- Quản lý đơn hàng và thanh toán
- Quản lý kho và nhập hàng
- Báo cáo và thống kê
- Tích hợp thanh toán MoMo

---

## 🔑 DANH SÁCH TẤT CẢ CHỨC NĂNG HIỆN CÓ

### 1. XÁC THỰC VÀ PHÂN QUYỀN (Authentication & Authorization)

#### 1.1 AuthenticationController (`/api/auth`)
- ✅ **POST /api/auth/login** - Đăng nhập
- ✅ **POST /api/auth/introspect** - Kiểm tra token
- ✅ **POST /api/auth/refresh** - Làm mới token
- ✅ **POST /api/auth/logout** - Đăng xuất

#### 1.2 ForgotPasswordController (`/api/auth/forgot-password`)
- ✅ **POST /api/auth/forgot-password/request** - Yêu cầu OTP quên mật khẩu
- ✅ **POST /api/auth/forgot-password/verify** - Xác thực OTP
- ✅ **POST /api/auth/forgot-password/reset** - Đặt lại mật khẩu

#### 1.3 AccountController (`/api/accounts`)
- ✅ **POST /api/accounts** - Tạo tài khoản (Admin only)
- ✅ **GET /api/accounts** - Lấy danh sách tài khoản (Admin only)
- ✅ **GET /api/accounts/{accountId}** - Lấy thông tin tài khoản (Admin only)
- ✅ **GET /api/accounts/my-info** - Lấy thông tin tài khoản hiện tại
- ✅ **PUT /api/accounts/{accountId}** - Cập nhật tài khoản
- ✅ **DELETE /api/accounts/{accountId}** - Xóa tài khoản (Admin only)
- ✅ **POST /api/accounts/{accountId}/assign-role/{roleId}** - Gán vai trò (Admin only)
- ✅ **DELETE /api/accounts/{accountId}/roles/{roleId}** - Gỡ vai trò (Admin/Shop Owner)
- ✅ **POST /api/accounts/{accountId}/change-password** - Đổi mật khẩu (Admin)
- ✅ **PUT /api/accounts/me/change-password** - Đổi mật khẩu cho chính mình
- ✅ **POST /api/accounts/shop-owners** - Tạo chủ cửa hàng (Admin only)
- ✅ **POST /api/accounts/staff** - Tạo nhân viên (Shop Owner only)
- ✅ **PUT /api/accounts/staff/{staffId}** - Cập nhật thông tin nhân viên (Shop Owner)
- ✅ **PUT /api/accounts/staff/{staffId}/roles** - Cập nhật vai trò nhân viên (Shop Owner)
- ✅ **PUT /api/accounts/admin/{accountId}** - Admin cập nhật tài khoản (Admin only)

#### 1.4 RoleController (`/api/roles`)
- ✅ **POST /api/roles** - Tạo vai trò (Admin only)
- ✅ **GET /api/roles** - Lấy danh sách vai trò (Admin/Shop Owner)
- ✅ **GET /api/roles/{roleId}** - Lấy thông tin vai trò (Admin/Shop Owner)
- ✅ **PUT /api/roles/{roleId}** - Cập nhật vai trò (Admin/Shop Owner)
- ✅ **DELETE /api/roles/{roleId}** - Xóa vai trò (Admin/Shop Owner)
- ✅ **GET /api/roles/{roleId}/permissions** - Lấy danh sách quyền của vai trò (Admin/Shop Owner)
- ✅ **POST /api/roles/{roleId}/permissions/{permissionId}** - Thêm quyền vào vai trò (Admin/Shop Owner)
- ✅ **DELETE /api/roles/{roleId}/permissions/{permissionId}** - Xóa quyền khỏi vai trò (Admin/Shop Owner)
- ✅ **PUT /api/roles/{roleId}/permissions** - Cập nhật toàn bộ quyền cho vai trò (Admin/Shop Owner)

#### 1.5 PermissionController (`/api/permissions`)
- ✅ **POST /api/permissions** - Tạo quyền (Admin only)
- ✅ **GET /api/permissions** - Lấy danh sách quyền (Admin/Shop Owner)
- ✅ **GET /api/permissions/{permissionId}** - Lấy thông tin quyền (Admin/Shop Owner)
- ✅ **PUT /api/permissions/{permissionId}** - Cập nhật quyền (Admin/Shop Owner)
- ✅ **DELETE /api/permissions/{permissionId}** - Xóa quyền (Admin only)

---

### 2. QUẢN LÝ SẢN PHẨM VÀ DANH MỤC

#### 2.1 CategoryController (`/api/categories`)
- ✅ **POST /api/categories** - Tạo danh mục
- ✅ **GET /api/categories** - Lấy tất cả danh mục
- ✅ **GET /api/categories/{id}** - Lấy danh mục theo ID
- ✅ **PUT /api/categories/{id}** - Cập nhật danh mục
- ✅ **DELETE /api/categories/{id}** - Xóa danh mục

#### 2.2 ProductController (`/api/products`)
- ✅ **POST /api/products** - Tạo sản phẩm
- ✅ **PUT /api/products/{id}** - Cập nhật sản phẩm
- ✅ **GET /api/products** - Lấy tất cả sản phẩm (Admin only)
- ✅ **GET /api/products/{id}** - Lấy sản phẩm theo ID
- ✅ **DELETE /api/products/{id}** - Xóa sản phẩm
- ✅ **POST /api/products/import** - Nhập hàng loạt sản phẩm

#### 2.3 ProductPriceController (`/api/product-prices`)
- ✅ **POST /api/product-prices** - Tạo giá sản phẩm
- ✅ **PUT /api/product-prices/{id}** - Cập nhật giá sản phẩm
- ✅ **GET /api/product-prices** - Lấy tất cả giá sản phẩm
- ✅ **GET /api/product-prices/{id}** - Lấy giá sản phẩm theo ID
- ✅ **DELETE /api/product-prices/{id}** - Xóa giá sản phẩm

---

### 3. QUẢN LÝ KHÁCH HÀNG

#### 3.1 CustomerController (`/api/customers`)
- ✅ **POST /api/customers** - Tạo khách hàng
- ✅ **GET /api/customers** - Lấy tất cả khách hàng
- ✅ **GET /api/customers/{id}** - Lấy khách hàng theo ID
- ✅ **PUT /api/customers/{id}** - Cập nhật khách hàng
- ✅ **DELETE /api/customers/{id}** - Xóa khách hàng
- ✅ **GET /api/customers/search?keyword=** - Tìm kiếm khách hàng
- ✅ **GET /api/customers/phone/{phone}** - Lấy khách hàng theo số điện thoại

---

### 4. QUẢN LÝ ĐƠN HÀNG VÀ THANH TOÁN

#### 4.1 OrderController (`/api/orders`)
- ✅ **POST /api/orders** - Tạo đơn hàng
- ✅ **GET /api/orders** - Lấy tất cả đơn hàng
- ✅ **GET /api/orders/{id}** - Lấy đơn hàng theo ID
- ✅ **POST /api/orders/{id}/hold** - Tạm giữ đơn hàng (chuyển sang trạng thái chờ)
- ✅ **POST /api/orders/{id}/complete** - Hoàn tất đơn hàng
- ✅ **POST /api/orders/{id}/cancel** - Hủy đơn hàng

#### 4.2 PaymentController (`/api/payments`)
- ✅ **POST /api/payments** - Tạo thanh toán
- ✅ **PUT /api/payments/{id}/finalize** - Hoàn tất thanh toán
- ✅ **PUT /api/payments/{id}/refund** - Hoàn tiền
- ✅ **GET /api/payments/order/{orderId}** - Lấy danh sách thanh toán theo đơn hàng

#### 4.3 MoMoController (`/api/payments/momo`)
- ✅ **POST /api/payments/momo/notify** - Webhook nhận thông báo từ MoMo (public)
- ✅ **GET /api/payments/momo/return** - Callback URL từ MoMo (public)

---

### 5. QUẢN LÝ KHO VÀ NHẬP HÀNG

#### 5.1 InventoryController (`/api/inventories`)
- ✅ **POST /api/inventories** - Tạo bản ghi tồn kho
- ✅ **PUT /api/inventories/{id}** - Cập nhật tồn kho
- ✅ **GET /api/inventories** - Lấy tất cả tồn kho
- ✅ **GET /api/inventories/{id}** - Lấy tồn kho theo ID
- ✅ **DELETE /api/inventories/{id}** - Xóa tồn kho

#### 5.2 PurchaseOrderController (`/api/purchase-orders`)
- ✅ **POST /api/purchase-orders** - Tạo phiếu nhập hàng (Admin/Shop Owner/Warehouse Staff)
- ✅ **PUT /api/purchase-orders/{id}/receive** - Nhận hàng (Admin/Shop Owner/Warehouse Staff)
- ✅ **PUT /api/purchase-orders/{id}/cancel** - Hủy phiếu nhập (Admin/Shop Owner/Warehouse Staff)
- ✅ **PUT /api/purchase-orders/{id}/approve** - Duyệt phiếu nhập (Admin/Shop Owner)
- ✅ **GET /api/purchase-orders** - Lấy tất cả phiếu nhập (Admin/Shop Owner/Warehouse Staff)
- ✅ **GET /api/purchase-orders/search** - Tìm kiếm phiếu nhập với phân trang và filter (Admin/Shop Owner/Warehouse Staff)

---

### 6. QUẢN LÝ NHÀ CUNG CẤP

#### 6.1 SupplierController (`/api/suppliers`)
- ✅ **POST /api/suppliers** - Tạo nhà cung cấp
- ✅ **PUT /api/suppliers/{id}** - Cập nhật nhà cung cấp
- ✅ **GET /api/suppliers** - Lấy tất cả nhà cung cấp
- ✅ **GET /api/suppliers/{id}** - Lấy nhà cung cấp theo ID
- ✅ **DELETE /api/suppliers/{id}** - Xóa nhà cung cấp

---

### 7. BÁO CÁO VÀ THỐNG KÊ

#### 7.1 RevenueController (`/api/revenue`)
- ✅ **GET /api/revenue/daily** - Doanh thu theo ngày (Admin/Shop Owner)
- ✅ **GET /api/revenue/monthly** - Doanh thu theo tháng (Admin/Shop Owner)
- ✅ **GET /api/revenue/yearly** - Doanh thu theo năm (Admin/Shop Owner)
- ✅ **GET /api/revenue/custom** - Doanh thu theo khoảng thời gian tùy chỉnh (Admin/Shop Owner)

#### 7.2 ReportController (`/api/reports`)
- ✅ **GET /api/reports/products-revenue** - Báo cáo doanh thu sản phẩm theo khoảng thời gian
- ✅ **GET /api/reports/products-revenue/flexible** - Báo cáo doanh thu sản phẩm linh hoạt với filter và sort

---

## ⚠️ VẤN ĐỀ VALIDATION CẦN KHẮC PHỤC

### 1. THIẾU `@Valid` TRONG CONTROLLERS

#### 🔴 Mức độ nghiêm trọng: CAO

**OrderController:**
- ❌ **POST /api/orders** - Thiếu `@Valid` cho `OrderCreateRequest`
  ```java
  // HIỆN TẠI:
  public ApiResponse<OrderResponse> createOrder(@RequestBody OrderCreateRequest req)
  
  // CẦN SỬA:
  public ApiResponse<OrderResponse> createOrder(@RequestBody @Valid OrderCreateRequest req)
  ```

**PaymentController:**
- ❌ **POST /api/payments** - Thiếu `@Valid` cho `PaymentRequest`
  ```java
  // HIỆN TẠI:
  public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentRequest request)
  
  // CẦN SỬA:
  public ApiResponse<PaymentResponse> createPayment(@RequestBody @Valid PaymentRequest request)
  ```

**AuthenticationController:**
- ❌ **POST /api/auth/logout** - Thiếu `@Valid` cho `LogoutRequest` (có `@NotBlank` trong DTO)
  ```java
  // HIỆN TẠI:
  public ApiResponse<Void> logout(@RequestBody LogoutRequest req)
  
  // CẦN SỬA:
  public ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest req)
  ```

---

### 2. VALIDATION CÒN THIẾU TRONG REQUEST DTOS

#### 🔴 Mức độ nghiêm trọng: CAO

**OrderCreateRequest:**
- ❌ `phone` - Nên có validation Pattern cho số điện thoại (hiện tại không có)
- ❌ `discountAmount` - Nên có `@DecimalMin(0)` để đảm bảo không âm
- ❌ `taxAmount` - Nên có `@DecimalMin(0)` để đảm bảo không âm
- ❌ `paymentMethod` - Nên có validation (không null/not blank hoặc enum)
- ❌ `usePoints` - Nên có `@Min(0)` để đảm bảo không âm

**CustomerCreateRequest:**
- ⚠️ `fullName` - Chỉ có `@Size`, nên thêm `@NotBlank` nếu bắt buộc
- ⚠️ `phone` - Chỉ có `@Size` và `@Pattern`, nên thêm `@NotBlank` nếu bắt buộc

**PurchaseOrderReceiveRequest:**
- ❌ `items` - Nên có `@NotEmpty` để đảm bảo có ít nhất 1 item khi nhận hàng
- ⚠️ `notes` - Optional, OK

**PurchaseOrderApproveRequest:**
- ❌ `ownerAccountId` - Nên có `@NotNull` nếu bắt buộc
- ⚠️ `notes` - Optional, OK

---

#### 🟡 Mức độ nghiêm trọng: TRUNG BÌNH

**OrderDetailRequest:**
- ⚠️ `discount` - Có `@DecimalMin(0)` nhưng có thể null, nên đảm bảo logic xử lý null

**ProductPriceCreateRequest:**
- ⚠️ `costPrice` - Optional nhưng có validation `@DecimalMin(0)`, OK

**ChangePasswordRequest:**
- ❌ Thiếu validation so sánh `newPassword` và `confirmNewPassword` (cần custom validator)

**AccountCreateRequest:**
- ❌ Thiếu validation so sánh `password` và `confirmPassword` (cần custom validator)

**ResetPasswordRequest:**
- ❌ Thiếu validation so sánh `newPassword` và `confirmNewPassword` (cần custom validator)

---

### 3. VALIDATION TRONG REQUEST PARAMETERS

#### 🟡 Mức độ nghiêm trọng: TRUNG BÌNH

**RevenueController:**
- ⚠️ `year`, `month` - Nên có `@Min`, `@Max` để giới hạn giá trị hợp lệ
  - year: `@Min(1900) @Max(2100)`
  - month: `@Min(1) @Max(12)`

**ReportController:**
- ⚠️ `limit` - Có `defaultValue = "10"` nhưng nên thêm `@Min(1) @Max(100)` trong service/validation
- ⚠️ `sortBy`, `sortDir` - Nên validate enum values

**CustomerController:**
- ⚠️ `keyword` trong search - Nên có validation để tránh SQL injection (dù đã dùng JPA, nhưng nên có `@Size(max=100)`)

**PurchaseOrderController:**
- ⚠️ `page`, `size` - Có validate trong code nhưng nên thêm validation ở parameter level
  - `size` có giới hạn tối đa 200 trong code, nhưng nên validate

---

### 4. CÁC VẤN ĐỀ VALIDATION KHÁC

#### 🟡 Mức độ nghiêm trọng: TRUNG BÌNH

1. **Pattern Validation cho Phone:**
   - Các nơi sử dụng phone có pattern khác nhau:
     - `AccountCreateRequest`: `^$|^\\d{10}$` (cho phép rỗng hoặc 10 số)
     - `CustomerCreateRequest`: `^\\+?[0-9]{10,15}$` (10-15 số, có thể có +)
     - `SupplierCreateRequest`: `^[0-9+\\-()\\s]{6,20}$` (6-20 ký tự, cho phép ký tự đặc biệt)
   - ⚠️ Nên thống nhất pattern validation cho số điện thoại Việt Nam

2. **URL Validation:**
   - `ProductCreateRequest.imageUrl` có `@URL` annotation ✅
   - `AccountCreateRequest.avatarUrl` không có validation ❌

3. **UUID Validation:**
   - Các UUID trong path parameters không có validation (Spring tự validate format)
   - ✅ OK, nhưng nên xử lý exception khi UUID không hợp lệ

4. **Date/DateTime Validation:**
   - Các tham số date trong `RevenueController` và `ReportController` sử dụng `@DateTimeFormat` ✅
   - Nên thêm validation để đảm bảo `from <= to`

---

## 📝 TỔNG KẾT ƯU TIÊN SỬA LỖI

### 🔴 ƯU TIÊN CAO (Cần sửa ngay)

1. ✅ Thêm `@Valid` vào:
   - `OrderController.createOrder()`
   - `PaymentController.createPayment()`
   - `AuthenticationController.logout()`

2. ✅ Thêm validation cho `OrderCreateRequest`:
   - `phone`: Pattern validation
   - `discountAmount`: `@DecimalMin(0)`
   - `taxAmount`: `@DecimalMin(0)`
   - `paymentMethod`: `@NotBlank` hoặc enum
   - `usePoints`: `@Min(0)`

3. ✅ Thêm `@NotEmpty` cho `PurchaseOrderReceiveRequest.items`

4. ✅ Thêm `@NotNull` cho `PurchaseOrderApproveRequest.ownerAccountId` (nếu bắt buộc)

5. ✅ Tạo custom validator cho so sánh password:
   - `ChangePasswordRequest`
   - `AccountCreateRequest`
   - `ResetPasswordRequest`

### 🟡 ƯU TIÊN TRUNG BÌNH

1. Thêm validation cho request parameters:
   - `RevenueController`: year, month
   - `ReportController`: limit, sortBy, sortDir
   - `CustomerController`: keyword

2. Thêm validation cho `CustomerCreateRequest`:
   - `fullName`: `@NotBlank` (nếu bắt buộc)
   - `phone`: `@NotBlank` (nếu bắt buộc)

3. Thống nhất pattern validation cho số điện thoại

4. Thêm validation cho `AccountCreateRequest.avatarUrl` (URL format)

### 🟢 ƯU TIÊN THẤP

1. Validate `from <= to` cho date range trong reports
2. Cải thiện error messages (tiếng Việt nhất quán)
3. Thêm validation cho các trường optional nhưng có giá trị cần validate format

---

## ✅ ĐIỂM MẠNH VỀ VALIDATION

1. ✅ Hầu hết các Request DTO đã có validation annotations
2. ✅ Sử dụng đầy đủ các annotation: `@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Pattern`, `@Email`
3. ✅ Message validation đều bằng tiếng Việt, dễ hiểu
4. ✅ Phần lớn controllers đã sử dụng `@Valid`
5. ✅ Validation cho các trường quan trọng như email, password đã được thực hiện tốt

---

## 🔧 ĐỀ XUẤT CẢI THIỆN

1. **Tạo Custom Validators:**
   - Password confirmation validator
   - Vietnamese phone number validator (thống nhất)
   - Date range validator (from <= to)

2. **Tạo Validation Groups:**
   - Create vs Update groups cho các DTO có thể dùng chung

3. **Centralized Validation:**
   - Tạo một class chứa các pattern constants (phone, username, etc.)

4. **Error Handling:**
   - Đảm bảo `GlobalExceptionHandler` xử lý đầy đủ các validation errors

---

*Báo cáo được tạo tự động từ phân tích codebase ngày: 2025-01-27*

