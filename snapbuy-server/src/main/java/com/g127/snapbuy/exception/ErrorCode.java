package com.g127.snapbuy.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIZED_ERROR(9999, "Lỗi không phân loại"),
    EMAIL_EXISTED(1001, "Email đã tồn tại"),
    NAME_EXISTED(1002, "Tên đã tồn tại"),
    CODE_EXISTED(1003, "Mã đã tồn tại"),
    BARCODE_ALREADY_EXISTS(1004, "Barcode đã tồn tại trong hệ thống"),
    PHONE_EXISTED(1005, "Số điện thoại đã tồn tại"),

    CUSTOMER_NOT_FOUND(2001, "Không tìm thấy khách hàng"),
    CATEGORY_NOT_FOUND(2002, "Không tìm thấy danh mục"),
    PARENT_NOT_FOUND(2003, "Không tìm thấy danh mục cha"),
    SUPPLIER_NOT_FOUND(2004, "Không tìm thấy nhà cung cấp"),
    PRODUCT_NOT_FOUND(2005, "Không tìm thấy sản phẩm"),
    PRICE_NOT_FOUND(2006, "Không tìm thấy giá"),
    INVENTORY_NOT_FOUND(2007, "Không tìm thấy tồn kho"),
    INVENTORY_ALREADY_EXISTS(2008, "Tồn kho cho sản phẩm này đã tồn tại"),
    INVALID_STOCK_OPERATION(2009, "Thao tác tồn kho không hợp lệ — số lượng không được âm"),
    ORDER_NOT_FOUND(2010, "Không tìm thấy đơn hàng"),
    PURCHASE_ORDER_NOT_FOUND(2011, "Không tìm thấy phiếu tạo đơn"),
    PROMOTION_NOT_FOUND(2012, "Không tìm thấy khuyến mãi"),
    INVALID_DATE_RANGE(2013, "Khoảng thời gian không hợp lệ"),

    AUTH_INVALID(3001, "Tên đăng nhập hoặc mật khẩu không đúng"),
    TOKEN_INVALID(3002, "Token không hợp lệ"),
    TOKEN_REVOKED(3003, "Token đã bị thu hồi"),
    ACCOUNT_LOCKED(3004, "Tài khoản đã bị khóa"),
    FILE_UPLOAD_FAILED(3005, "Tải ảnh thất bại");

    private final int code;
    private final String message;
}
