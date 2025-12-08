package com.g127.snapbuy.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IntrospectRequest {
    @NotBlank(message = "Vui lòng nhập Token")
    private String token;
}