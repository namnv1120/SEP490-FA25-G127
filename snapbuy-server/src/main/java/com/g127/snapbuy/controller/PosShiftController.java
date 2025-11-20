package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PosShiftOpenRequest;
import com.g127.snapbuy.dto.request.PosShiftCloseRequest;
import com.g127.snapbuy.dto.response.PosShiftResponse;
import com.g127.snapbuy.service.PosShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pos-shifts")
@RequiredArgsConstructor
public class PosShiftController {

    private final PosShiftService posShiftService;

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<PosShiftResponse> current(@AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        res.setResult(posShiftService.getCurrent(principal.getUsername()));
        return res;
    }

    @PostMapping("/open")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<PosShiftResponse> open(@Valid @RequestBody PosShiftOpenRequest req,
                                              @AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        res.setResult(posShiftService.open(principal.getUsername(), req.getInitialCash()));
        return res;
    }

    @PostMapping("/close")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<PosShiftResponse> close(@Valid @RequestBody PosShiftCloseRequest req,
                                               @AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        res.setResult(posShiftService.close(principal.getUsername(), req.getClosingCash()));
        return res;
    }
}

