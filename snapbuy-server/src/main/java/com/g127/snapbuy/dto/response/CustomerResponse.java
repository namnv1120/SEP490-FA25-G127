package com.g127.snapbuy.dto.response;

import com.g127.snapbuy.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CustomerResponse {
    private UUID customerId;
    private String customerCode;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String district;
    private String ward;
    private LocalDate dateOfBirth;
    private Customer.Gender gender;
    private Customer.CustomerType customerType;
    private String taxCode;
    private BigDecimal creditLimit;
    private Customer.CustomerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
