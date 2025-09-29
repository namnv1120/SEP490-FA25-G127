// ErrorCode.java
package com.g127.snapbuy.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIZED_ERROR(9999, "Uncategorized error"),
    EMAIL_EXISTED(1001, "Email existed"),
    NAME_EXISTED(1002, "Name existed"),
    CODE_EXISTED(1003, "Code existed"),
    CUSTOMER_NOT_FOUND(2001, "Customer not found"),
    CATEGORY_NOT_FOUND(2002, "Category not found"),
    PARENT_NOT_FOUND(2003, "Parent not found"),
    SUPPLIER_NOT_FOUND(2004, "Supplier not found"),
    ;
    private final int code;
    private final String message;
}
