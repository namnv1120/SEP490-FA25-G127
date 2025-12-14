package com.g127.snapbuy.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetrics {
    private Double cpuUsage;
    private Double memoryUsage;
    private Double diskUsage;
    private Long uptime;
    private Long totalMemory;      // Total system RAM in bytes
    private Long usedMemory;       // Used system RAM in bytes
    private Long freeMemory;       // Free system RAM in bytes
    private Long totalDisk;        // Total disk space in bytes
    private Long usedDisk;         // Used disk space in bytes
    private Long freeDisk;         // Free disk space in bytes
    private Integer cpuCores;      // Number of CPU cores
    private Double cpuSpeed;       // CPU speed in GHz
}
