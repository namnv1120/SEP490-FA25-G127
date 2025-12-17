package com.g127.snapbuy.common.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Controller để proxy các request đến API địa điểm hành chính Việt Nam
 * Sử dụng 34tinhthanh.com - dữ liệu 34 tỉnh/thành sau sáp nhập 7/2025
 * Tránh CORS issues khi frontend gọi trực tiếp external API
 */
@Slf4j
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private static final String LOCATION_API_BASE_URL = "https://34tinhthanh.com/api";
    private final RestTemplate restTemplate;

    public LocationController() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(30000); 
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Lấy danh sách tất cả tỉnh/thành phố (34 tỉnh sau sáp nhập 7/2025)
     * @return Danh sách 34 tỉnh/thành phố
     */
    @GetMapping("/provinces")
    public ResponseEntity<?> getProvinces() {
        try {
            log.info("Fetching 34 provinces from 34tinhthanh.com API");
            String url = LOCATION_API_BASE_URL + "/provinces";
            log.info("Calling URL: {}", url);
            
            Object response = restTemplate.getForObject(url, Object.class);
            
            log.info("Successfully received response from API");
            return ResponseEntity.ok(response);
        } catch (RestClientException e) {
            log.error("RestClientException when fetching provinces: {}", e.getMessage());
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Full stack trace:", e);
            return ResponseEntity.status(502).body("Failed to fetch provinces: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error fetching provinces: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách phường/xã theo mã tỉnh (sau sáp nhập không còn cấp huyện)
     * @param provinceCode Mã tỉnh/thành phố (ví dụ: "01" cho Hà Nội)
     * @return Danh sách phường/xã
     */
    @GetMapping("/wards/{provinceCode}")
    public ResponseEntity<?> getWardsByProvince(@PathVariable String provinceCode) {
        try {
            log.info("Fetching wards for province code: {}", provinceCode);
            String url = LOCATION_API_BASE_URL + "/wards?province_code=" + provinceCode;
            Object response = restTemplate.getForObject(url, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching wards for province {}: {}", provinceCode, e.getMessage(), e);
            return ResponseEntity.status(502).body("Failed to fetch wards from external API");
        }
    }
}
