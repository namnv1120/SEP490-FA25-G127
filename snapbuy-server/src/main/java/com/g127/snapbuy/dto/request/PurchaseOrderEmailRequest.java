package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderEmailRequest {
    @NotEmpty(message = "Danh sách đơn hàng không được rỗng")
    private List<UUID> purchaseOrderIds;
    
    @NotBlank(message = "Tiêu đề email không được để trống")
    private String subject;
    
    @NotBlank(message = "Nội dung email không được để trống")
    private String htmlContent;
    
    private boolean forceResend = false;
}

