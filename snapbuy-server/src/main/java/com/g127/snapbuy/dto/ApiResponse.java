package com.g127.snapbuy.dto;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiResponse<T> {
    private String code;
    private String message;
    private T result;
    public static <T> ApiResponse<T> ok(T result){
        return ApiResponse.<T>builder().code("SUCCESS").message("OK").result(result).build();
    }
}