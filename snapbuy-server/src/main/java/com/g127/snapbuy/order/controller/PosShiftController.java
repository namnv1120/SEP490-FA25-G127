package com.g127.snapbuy.order.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.order.dto.request.PosShiftOpenRequest;
import com.g127.snapbuy.order.dto.request.PosShiftOpenForEmployeeRequest;
import com.g127.snapbuy.order.dto.request.PosShiftCloseRequest;
import com.g127.snapbuy.order.dto.request.PosShiftCloseForEmployeeRequest;
import com.g127.snapbuy.order.dto.response.PosShiftResponse;
import com.g127.snapbuy.order.service.PosShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PosShiftResponse> open(@Valid @RequestBody PosShiftOpenRequest req,
                                              @AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        res.setResult(posShiftService.open(principal.getUsername(), req.getInitialCash(), req.getCashDenominations()));
        return res;
    }

    @PostMapping("/open-for-employee")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PosShiftResponse> openForEmployee(@Valid @RequestBody PosShiftOpenForEmployeeRequest req,
                                                         @AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        res.setResult(posShiftService.openForEmployee(principal.getUsername(), req.getEmployeeAccountId(), req.getInitialCash(), req.getCashDenominations()));
        return res;
    }

    @PostMapping("/close")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<PosShiftResponse> close(@Valid @RequestBody PosShiftCloseRequest req,
                                               @AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        PosShiftResponse result = posShiftService.close(principal.getUsername(), req.getClosingCash(), req.getNote(), req.getCashDenominations());
        res.setResult(result);
        return res;
    }

    @PostMapping("/close-for-employee")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PosShiftResponse> closeForEmployee(@Valid @RequestBody PosShiftCloseForEmployeeRequest req,
                                                          @AuthenticationPrincipal User principal) {
        ApiResponse<PosShiftResponse> res = new ApiResponse<>();
        PosShiftResponse result = posShiftService.closeForEmployee(
                principal.getUsername(),
                req.getEmployeeAccountId(),
                req.getClosingCash(),
                req.getNote(),
                req.getCashDenominations()
        );
        res.setResult(result);
        return res;
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<List<PosShiftResponse>> myShifts(@AuthenticationPrincipal User principal,
                                                        @RequestParam(required = false) String status) {
        ApiResponse<List<PosShiftResponse>> res = new ApiResponse<>();
        res.setResult(posShiftService.getMyShifts(principal.getUsername(), status));
        return res;
    }

    @GetMapping("/by-account/{accountId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<PosShiftResponse>> getByAccount(@PathVariable UUID accountId,
                                                            @RequestParam(required = false) String status) {
        ApiResponse<List<PosShiftResponse>> res = new ApiResponse<>();
        res.setResult(posShiftService.getShiftsByAccount(accountId, status));
        return res;
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<PosShiftResponse>> getAllActiveShifts(@AuthenticationPrincipal User principal) {
        ApiResponse<List<PosShiftResponse>> res = new ApiResponse<>();
        res.setResult(posShiftService.getAllActiveShifts(principal.getUsername()));
        return res;
    }
}
