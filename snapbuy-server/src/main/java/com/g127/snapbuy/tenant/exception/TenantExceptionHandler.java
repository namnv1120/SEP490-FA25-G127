package com.g127.snapbuy.tenant.exception;

import com.g127.snapbuy.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice(basePackages = "com.g127.snapbuy.tenant")
public class TenantExceptionHandler {

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataAccessException(DataAccessException ex) {
        log.error("Database error in tenant management: ", ex);
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(5000);
        
        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("Invalid object name 'tenants'")) {
                response.setMessage("Lỗi cơ sở dữ liệu: Bảng 'tenants' chưa được tạo. Vui lòng kiểm tra Flyway migration cho Master database.");
            } else if (message.contains("Invalid object name")) {
                response.setMessage("Lỗi cơ sở dữ liệu: Thiếu bảng dữ liệu cần thiết. Vui lòng kiểm tra cấu hình database.");
            } else if (message.contains("Cannot create PoolableConnectionFactory")) {
                response.setMessage("Không thể kết nối đến database. Vui lòng kiểm tra thông tin kết nối.");
            } else {
                response.setMessage("Lỗi thao tác cơ sở dữ liệu: " + getRootCauseMessage(ex));
            }
        } else {
            response.setMessage("Lỗi không xác định khi thao tác cơ sở dữ liệu");
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Invalid argument: ", ex);
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(4000);
        response.setMessage("Dữ liệu không hợp lệ: " + ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error in tenant management: ", ex);
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(9999);
        response.setMessage("Lỗi hệ thống: " + getRootCauseMessage(ex));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String getRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause.getMessage() != null ? cause.getMessage() : ex.getMessage();
    }
}
