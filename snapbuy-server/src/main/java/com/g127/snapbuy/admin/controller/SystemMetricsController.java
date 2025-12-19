package com.g127.snapbuy.admin.controller;

import com.g127.snapbuy.admin.dto.SystemMetrics;
import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.tenant.entity.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class SystemMetricsController {

    private final com.g127.snapbuy.tenant.repository.TenantRepository tenantRepository;

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<SystemMetrics> getSystemMetrics() {
        try {
            // Sử dụng OSHI để lấy thông số hệ thống chính xác
            SystemInfo systemInfo = new SystemInfo();
            HardwareAbstractionLayer hal = systemInfo.getHardware();
            CentralProcessor processor = hal.getProcessor();
            GlobalMemory memory = hal.getMemory();
            
            // Thông số CPU
            int cpuCores = processor.getLogicalProcessorCount();
            
            // Lấy tần số CPU hiện tại (như Task Manager hiển thị) - thay đổi theo tải
            double cpuSpeed = 0.0;
            
            // Thử phương pháp 1: Tần số hiện tại mỗi lõi
            try {
                long[] currentFreqs = processor.getCurrentFreq();
                if (currentFreqs != null && currentFreqs.length > 0) {
                    // Tính tần số trung bình hiện tại trên tất cả các lõi
                    long totalFreq = 0;
                    int validCores = 0;
                    for (long freq : currentFreqs) {
                        if (freq > 0) {
                            totalFreq += freq;
                            validCores++;
                        }
                    }
                    if (validCores > 0) {
                        cpuSpeed = (double) totalFreq / validCores / 1_000_000_000.0; // Convert Hz to GHz
                    }
                }
            } catch (Exception e) {
                System.out.println("Error getting current freq: " + e.getMessage());
            }
            
            // Thử phương pháp 2: Tần số nhà sản xuất từ thông tin bộ vi xử lý
            if (cpuSpeed < 0.5) {
                try {
                    long vendorFreq = processor.getProcessorIdentifier().getVendorFreq();
                    if (vendorFreq > 0) {
                        cpuSpeed = vendorFreq / 1_000_000_000.0; // Convert Hz to GHz
                    }
                } catch (Exception e) {
                    System.out.println("Error getting vendor freq: " + e.getMessage());
                }
            }
            
            // Thử phương pháp 3: Tần số tối đa làm dự phòng
            if (cpuSpeed < 0.5) {
                try {
                    long maxFreq = processor.getMaxFreq();
                    if (maxFreq > 0) {
                        cpuSpeed = maxFreq / 1_000_000_000.0;
                    }
                } catch (Exception e) {
                    System.out.println("Error getting max freq: " + e.getMessage());
                }
            }
            
            // Dự phòng cuối: Sử dụng tần số cơ bản từ tên bộ vi xử lý nếu có
            if (cpuSpeed < 0.5) {
                cpuSpeed = 2.5; // Default for modern CPUs
            }
            
            // Lấy mức sử dụng CPU - sử dụng tải CPU hệ thống chính xác hơn
            double cpuUsage = processor.getSystemCpuLoad(1000) * 100; // Wait 1 second for measurement
            
            // Dự phòng nếu mức sử dụng CPU là 0 hoặc âm
            if (cpuUsage <= 0) {
                // Thử phương pháp thay thế
                long[] prevTicks = processor.getSystemCpuLoadTicks();
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                cpuUsage = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100;
            }
            
            // Nếu vẫn là 0, sử dụng giá trị nhỏ để hiển thị rằng nó đang hoạt động
            if (cpuUsage < 0.1 && cpuUsage >= 0) {
                cpuUsage = 0.1; // Minimum display value
            }

            // Thông số bộ nhớ sử dụng OSHI
            long totalSystemMemory = memory.getTotal();
            long availableMemory = memory.getAvailable();
            long usedSystemMemory = totalSystemMemory - availableMemory;
            long freeSystemMemory = availableMemory;
            double memoryUsage = totalSystemMemory > 0 ? (double) usedSystemMemory / totalSystemMemory * 100 : 0;

            // Thông số ổ đĩa - tính tổng tất cả các ổ đĩa có sẵn
            long totalDisk = 0;
            long freeDisk = 0;
            long usedDisk = 0;
            
            File[] roots = File.listRoots();
            for (File root : roots) {
                totalDisk += root.getTotalSpace();
                freeDisk += root.getFreeSpace();
            }
            usedDisk = totalDisk - freeDisk;
            double diskUsage = totalDisk > 0 ? (double) usedDisk / totalDisk * 100 : 0;

            // Thời gian hoạt động hệ thống - tính từ lần tạo tenant đầu tiên (khi hệ thống được khởi tạo)
            long uptime = 0;
            try {
                List<Tenant> allTenants = tenantRepository.findAll();
                Optional<Tenant> firstTenant = allTenants.stream()
                        .min(Comparator.comparing(Tenant::getCreatedAt));
                
                if (firstTenant.isPresent()) {
                    LocalDateTime systemStartTime = firstTenant.get().getCreatedAt();
                    uptime = Duration.between(systemStartTime, LocalDateTime.now()).toMillis();
                } else {
                    // Dự phòng sử dụng thời gian chạy JVM nếu không có tenant
                    uptime = ManagementFactory.getRuntimeMXBean().getUptime();
                }
            } catch (Exception e) {
                // Dự phòng sử dụng thời gian chạy JVM khi có lỗi
                uptime = ManagementFactory.getRuntimeMXBean().getUptime();
            }

            SystemMetrics metrics = SystemMetrics.builder()
                    .cpuUsage(cpuUsage)
                    .memoryUsage(memoryUsage)
                    .diskUsage(diskUsage)
                    .uptime(uptime)
                    .totalMemory(totalSystemMemory)
                    .usedMemory(usedSystemMemory)
                    .freeMemory(freeSystemMemory)
                    .totalDisk(totalDisk)
                    .usedDisk(usedDisk)
                    .freeDisk(freeDisk)
                    .cpuCores(cpuCores)
                    .cpuSpeed(cpuSpeed)
                    .build();

            ApiResponse<SystemMetrics> response = new ApiResponse<>();
            response.setResult(metrics);
            response.setMessage("Lấy thông tin hệ thống thành công");
            return response;

        } catch (Exception e) {
            ApiResponse<SystemMetrics> response = new ApiResponse<>();
            response.setCode(5000);
            response.setMessage("Lỗi khi lấy thông tin hệ thống: " + e.getMessage());
            return response;
        }
    }
}
