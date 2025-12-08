package com.g127.snapbuy.auth.service.impl;

import com.g127.snapbuy.auth.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.auth.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.auth.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.auth.service.ForgotPasswordService;
import com.g127.snapbuy.auth.service.MailService;
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
            DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy");

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

        String subject = "[SnapBuy] Mã OTP đặt lại mật khẩu";
        String boxes = java.util.Arrays.stream(code.split("")).map(d ->
                "<div style='width:44px;height:44px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;color:#0f172a;font-weight:700;font-size:20px;line-height:44px;text-align:center'>" + d + "</div>"
        ).collect(java.util.stream.Collectors.joining("<div style='width:8px'></div>"));
        String html = "<!DOCTYPE html><html lang=\"vi\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>SnapBuy - Mã OTP</title></head>"
                + "<body style=\"background:#f6f9fc;padding:24px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\">"
                + "<div style=\"max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 24px rgba(17,24,39,.08);\">"
                + "<div style=\"padding:24px 24px 16px;border-bottom:1px solid #f1f5f9;\"><div style=\"font-weight:700;font-size:20px;color:#0f172a;\">SnapBuy</div><div style=\"margin-top:8px;color:#6b7280;font-size:14px;\">Xác nhận đặt lại mật khẩu</div></div>"
                + "<div style=\"padding:24px;\"><p style=\"color:#0f172a;font-size:16px;margin:0 0 8px;\">Xin chào " + acc.getUsername() + ",</p><p style=\"color:#475569;font-size:14px;margin:0 0 16px;\">Mã OTP của bạn:</p>"
                + "<div style=\"display:flex;justify-content:center;align-items:center;margin:12px 0 20px;\">" + boxes + "</div>"
                + "<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;color:#334155;font-size:14px;\">OTP có hiệu lực đến: " + expiresAt.format(OTP_EXPIRY_FORMATTER) + "</div>"
                + "<p style=\"color:#64748b;font-size:13px;margin-top:16px;\">Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p></div>"
                + "<div style=\"padding:16px 24px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;text-align:center;\">© " + OffsetDateTime.now().getYear() + " SnapBuy</div></div></body></html>";
        mailService.sendHtml(email, subject, html);
        log.info("Cấp OTP cho {} hết hạn vào {}", email, expiresAt);
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
