package com.g127.snapbuy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportFullResponse {
    private InventoryReportOverviewResponse overview;
    private List<InventoryReportResponse> details;
}
