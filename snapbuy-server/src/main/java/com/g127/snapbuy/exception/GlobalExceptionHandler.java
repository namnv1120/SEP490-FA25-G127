package com.g127.snapbuy.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.g127.snapbuy.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<?> response = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<?>> handleRuntimeException(Exception ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(9999)
                .message("Internal server error: " + ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        ApiResponse<?> response = ApiResponse.builder()
                .code(4000)
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<?>> handleJsonParseExceptions(HttpMessageNotReadableException ex) {
        String message = "Invalid request format";

        if (ex.getCause() instanceof InvalidFormatException invalidFormat) {
            if (invalidFormat.getTargetType().isEnum()) {
                message = "Invalid value for field. Accepted values: " +
                        Arrays.toString(invalidFormat.getTargetType().getEnumConstants());
            }
        }
        ApiResponse<?> response = ApiResponse.builder()
                .code(4000)
                .message(message)
                .build();
        return ResponseEntity.badRequest().body(response);
    }

}
