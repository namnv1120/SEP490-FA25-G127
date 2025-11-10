package com.g127.snapbuy.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.g127.snapbuy.dto.ApiResponse;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<?> response = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleRuntimeException(Exception ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(9999)
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining("; "));
        ApiResponse<?> response = ApiResponse.builder()
                .code(4000)
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleJsonParseExceptions(HttpMessageNotReadableException ex) {
        String message = "Định dạng yêu cầu không hợp lệ";

        if (ex.getCause() instanceof InvalidFormatException invalidFormat) {
            if (invalidFormat.getTargetType().isEnum()) {
                message = "Giá trị không hợp lệ cho trường. Giá trị được chấp nhận: " +
                        Arrays.toString(invalidFormat.getTargetType().getEnumConstants());
            } else if (invalidFormat.getTargetType() == UUID.class) {
                message = "Lỗi định dạng UUID. Vui lòng cung cấp UUID hợp lệ.";
            }
        }

        ApiResponse<?> response = ApiResponse.builder()
                .code(4001)
                .message(message)
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiResponse<?>> handleBadCredentials(Exception ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(ErrorCode.AUTH_INVALID.getCode())
                .message(ErrorCode.AUTH_INVALID.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler({LockedException.class, DisabledException.class})
    public ResponseEntity<ApiResponse<?>> handleAccountLocked(Exception ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(ErrorCode.ACCOUNT_LOCKED.getCode())
                .message(ErrorCode.ACCOUNT_LOCKED.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ApiResponse<?>> handleIllegalArgs(RuntimeException ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(4002)
                .message(ex.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(NoSuchElementException ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(4003)
                .message(ex.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_ERROR;

        // Kiểm tra nếu là lỗi duplicate barcode
        if (message != null && message.contains("UX_products_barcode")) {
            errorCode = ErrorCode.BARCODE_ALREADY_EXISTS;
        }
        // Kiểm tra nếu là lỗi duplicate product code
        else if (message != null && (message.contains("UX_products_product_code") || message.contains("product_code"))) {
            errorCode = ErrorCode.CODE_EXISTED;
        }
        // Kiểm tra các constraint khác nếu cần

        ApiResponse<?> response = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.badRequest().body(response);
    }
}

