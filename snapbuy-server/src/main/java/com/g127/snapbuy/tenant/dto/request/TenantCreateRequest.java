package com.g127.snapbuy.tenant.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TenantCreateRequest {
    
    @NotBlank(message = "Tên cửa hàng không được để trống")
    private String tenantName;
    
    @NotBlank(message = "Mã cửa hàng không được để trống")
    @Pattern(regexp = "^[a-z0-9_-]{3,50}$", message = "Mã cửa hàng chỉ chứa chữ thường, số, gạch dưới và gạch ngang")
    private String tenantCode;
    
    @NotBlank(message = "Tên cơ sở dữ liệu không được để trống")
    private String dbName;
    
    private String dbHost = "localhost";
    
    @NotNull(message = "Port cơ sở dữ liệu không được để trống")
    private Integer dbPort = 1433;
    
    @NotBlank(message = "Username cơ sở dữ liệu không được để trống")
    private String dbUsername;
    
    @NotBlank(message = "Password cơ sở dữ liệu không được để trống")
    private String dbPassword;
    
    // Owner info
    @NotBlank(message = "Tên đăng nhập chủ cửa hàng không được để trống")
    private String ownerUsername;
    
    @NotBlank(message = "Mật khẩu chủ cửa hàng không được để trống")
    private String ownerPassword;
    
    @NotBlank(message = "Họ tên chủ cửa hàng không được để trống")
    private String ownerFullName;
    
    @NotBlank(message = "Email chủ cửa hàng không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Email không hợp lệ")
    private String ownerEmail;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String ownerPhone;
    
    private Integer maxUsers = 10;
    private Integer maxProducts = 1000;
}
