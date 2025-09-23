package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.*;
import com.g127.snapbuy.entity.User;
import com.g127.snapbuy.exception.ResourceNotFoundException;
import com.g127.snapbuy.repository.UserRepository;
import com.g127.snapbuy.service.ForgotPasswordService;
import com.g127.snapbuy.service.MailService;
import com.g127.snapbuy.service.OtpStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final OtpStore otpStore;

    private static final int EXPIRE_MINUTES = 2;
    private static final int RESEND_GAP_SECONDS = 30;

    @Override
    public void requestOtp(ForgotPasswordRequest req) {
        String email = req.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        // chống spam gửi lại quá nhanh
        if (!otpStore.canResend(email, RESEND_GAP_SECONDS)) {
            throw new IllegalStateException("Please wait a moment before requesting again");
        }

        String code = String.format("%06d", new Random().nextInt(1_000_000));
        var expiresAt = OffsetDateTime.now().plusMinutes(EXPIRE_MINUTES);

        otpStore.put(email, code, expiresAt);
        otpStore.markResent(email);

        String subject = "[SnapBuy] Mã xác nhận đặt lại mật khẩu";
        String content = "Xin chào " + user.getFullName() + ",\n\n"
                + "Mã xác nhận của bạn là: " + code + "\n"
                + "Mã có hiệu lực đến: " + expiresAt + "\n\n"
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

    @Override
    public void resetPassword(ResetPasswordRequest req) {
        var rec = otpStore.get(req.getEmail());
        if (rec == null || !rec.code.equals(req.getCode()))
            throw new IllegalStateException("Invalid or expired code");

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // Invalidate OTP
        otpStore.remove(req.getEmail());

        log.info("Password reset for {}", req.getEmail());
    }
}
