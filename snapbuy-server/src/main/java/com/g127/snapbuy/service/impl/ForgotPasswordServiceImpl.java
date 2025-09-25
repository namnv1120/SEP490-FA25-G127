package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.exception.ResourceNotFoundException;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.service.ForgotPasswordService;
import com.g127.snapbuy.service.MailService;
import com.g127.snapbuy.service.OtpStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final OtpStore otpStore;

    private static final DateTimeFormatter OTP_EXPIRY_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final int EXPIRE_MINUTES = 2;
    private static final int RESEND_GAP_SECONDS = 30;

    @Override
    public void requestOtp(ForgotPasswordRequest req) {
        String email = req.getEmail();
        Account acc = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        if (!otpStore.canResend(email, RESEND_GAP_SECONDS)) {
            throw new IllegalStateException("Please wait a moment before requesting again");
        }

        String code = String.format("%06d", new Random().nextInt(1_000_000));
        var expiresAt = OffsetDateTime.now().plusMinutes(EXPIRE_MINUTES);

        otpStore.put(email, code, expiresAt);
        otpStore.markResent(email);

        String subject = "[SnapBuy] Mã xác nhận đặt lại mật khẩu";
        String content = "Xin chào " + acc.getUsername() + ",\n\n"
                + "Mã xác nhận của bạn là: " + code + "\n"
                + "Mã có hiệu lực đến: " + expiresAt.format(OTP_EXPIRY_FORMATTER) + "\n\n"
                + "Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.";

        mailService.send(email, subject, content);
        log.info("Issued OTP for {} exp={}", email, expiresAt);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest req) {
        var rec = otpStore.get(req.getEmail());
        if (rec == null) throw new IllegalStateException("Invalid or expired code");
        rec.attempts++;
        if (!rec.code.equals(req.getCode())) throw new IllegalStateException("Invalid or expired code");
    }

//    @Override
//    public void resetPassword(ResetPasswordRequest req) {
//        var rec = otpStore.get(req.getEmail());
//        if (rec == null || !rec.code.equals(req.getCode()))
//            throw new IllegalStateException("Invalid or expired code");
//
//        Account acc = accountRepository.findByEmail(req.getEmail())
//                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));
//
//        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
//        accountRepository.save(acc);
//
//        otpStore.remove(req.getEmail());
//        log.info("Password reset for {}", req.getEmail());
//    }

    @Override
    public void resetPassword(ResetPasswordRequest req) {
        // 1) kiểm tra confirm password
        if (req.getNewPassword() == null || !req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("PASSWORD_MISMATCH");
        }

        // 2) kiểm tra OTP
        var rec = otpStore.get(req.getEmail());
        if (rec == null || !rec.code.equals(req.getCode()))
            throw new IllegalStateException("Invalid or expired code");

        // 3) cập nhật mật khẩu
        Account acc = accountRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        accountRepository.save(acc);

        // 4) vô hiệu hoá OTP
        otpStore.remove(req.getEmail());
        log.info("Password reset for {}", req.getEmail());
    }
}
