// ErrorCode.java
package com.g127.snapbuy.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORISED_ERROR(9999, "Uncategorised error"),
    EMAIL_EXISTED(1001, "Email existed"),
    CUSTOMER_NOT_FOUND(1002, "Customer not found"),
    ;
    private final int code;
    private final String message;
}
