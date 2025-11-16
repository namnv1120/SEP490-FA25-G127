package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.service.ForgotPasswordService;
import com.g127.snapbuy.service.MailService;
import com.g127.snapbuy.config.OtpStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.NoSuchElementException;
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
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy email"));

        if (!otpStore.canResend(email, RESEND_GAP_SECONDS)) {
            throw new IllegalStateException("Vui lòng chờ trong giây lát trước khi yêu cầu lại");
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
    }

    @Override
    public void verifyOtp(VerifyOtpRequest req) {
        var rec = otpStore.get(req.getEmail());
        if (rec == null) throw new IllegalStateException("Mã xác nhận không hợp lệ hoặc đã hết hạn");
        rec.attempts++;
        if (!rec.code.equals(req.getCode())) {
            throw new IllegalStateException("Mã xác nhận không hợp lệ hoặc đã hết hạn");
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        var rec = otpStore.get(req.getEmail());
        if (rec == null || !rec.code.equals(req.getCode())) {
            throw new IllegalStateException("Mã xác nhận không hợp lệ hoặc đã hết hạn");
        }

        Account acc = accountRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy email"));

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        accountRepository.save(acc);

        otpStore.remove(req.getEmail());
    }

}
