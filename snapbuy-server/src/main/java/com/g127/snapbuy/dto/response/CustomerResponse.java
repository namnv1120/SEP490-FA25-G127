package com.g127.snapbuy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private UUID customerId;
    private String customerCode;
    private String fullName;
    private String phone;
    private String gender;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private Integer points;
    private Boolean active;
}