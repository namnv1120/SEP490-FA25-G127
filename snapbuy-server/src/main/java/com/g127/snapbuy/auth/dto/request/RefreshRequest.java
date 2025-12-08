package com.g127.snapbuy.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshRequest {
    @NotBlank(message = "Vui lòng cung cấp token.")
    private String token;
}
