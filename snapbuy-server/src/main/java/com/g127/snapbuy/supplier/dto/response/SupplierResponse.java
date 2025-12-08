package com.g127.snapbuy.supplier.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private UUID supplierId;
    private String supplierCode;
    private String supplierName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String ward;
    private Boolean active;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
