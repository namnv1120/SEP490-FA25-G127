package com.g127.snapbuy.auth.service.impl;

import com.g127.snapbuy.auth.dto.request.VerifyEmailOtpRequest;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.auth.service.EmailVerificationService;
import com.g127.snapbuy.auth.service.MailService;
import com.g127.snapbuy.config.OtpStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.NoSuchElementException;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final AccountRepository accountRepository;
    private final MailService mailService;
    private final OtpStore otpStore;

    private static final DateTimeFormatter OTP_EXPIRY_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy");

    private static final int EXPIRE_MINUTES = 2;
    private static final int RESEND_GAP_SECONDS = 30;

    @Override
    @Transactional
    public void requestOtp(UUID accountId, String newEmail) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        if (newEmail.equalsIgnoreCase(account.getEmail())) {
            throw new IllegalArgumentException("Email mới phải khác với email hiện tại");
        }

        Optional<Account> existingAccount = accountRepository.findByEmail(newEmail);
        if (existingAccount.isPresent() && !existingAccount.get().getAccountId().equals(accountId)) {
            throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác");
        }

        String otpKey = accountId.toString() + ":" + newEmail.toLowerCase();

        if (!otpStore.canResend(otpKey, RESEND_GAP_SECONDS)) {
            throw new IllegalStateException("Vui lòng chờ trong giây lát trước khi yêu cầu lại");
        }

        String code = String.format("%06d", new Random().nextInt(1_000_000));
        var expiresAt = OffsetDateTime.now().plusMinutes(EXPIRE_MINUTES);

        otpStore.put(otpKey, code, expiresAt);
        otpStore.markResent(otpKey);

        String subject = "[SnapBuy] Mã xác nhận thay đổi email";
        String boxes = Arrays.stream(code.split("")).map(d ->
                "<div style='width:44px;height:44px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;color:#0f172a;font-weight:700;font-size:20px;line-height:44px;text-align:center'>" + d + "</div>"
        ).collect(Collectors.joining("<div style='width:8px'></div>"));
        String html = "<!DOCTYPE html><html lang=\"vi\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>SnapBuy - Xác nhận email</title></head>"
                + "<body style=\"background:#f6f9fc;padding:24px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\">"
                + "<div style=\"max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 12px 24px rgba(17,24,39,.08);\">"
                + "<div style=\"padding:24px 24px 16px;border-bottom:1px solid #f1f5f9;\"><div style=\"font-weight:700;font-size:20px;color:#0f172a;\">SnapBuy</div><div style=\"margin-top:8px;color:#6b7280;font-size:14px;\">Xác nhận thay đổi email</div></div>"
                + "<div style=\"padding:24px;\"><p style=\"color:#0f172a;font-size:16px;margin:0 0 8px;\">Xin chào " + (account.getFullName() != null ? account.getFullName() : account.getUsername()) + ",</p>"
                + "<p style=\"color:#475569;font-size:14px;margin:0 0 8px;\">Bạn đã yêu cầu thay đổi email thành: <strong>" + newEmail + "</strong></p>"
                + "<p style=\"color:#475569;font-size:14px;margin:0 0 16px;\">Mã OTP của bạn:</p>"
                + "<div style=\"display:flex;justify-content:center;align-items:center;margin:12px 0 20px;\">" + boxes + "</div>"
                + "<div style=\"background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;color:#334155;font-size:14px;\">OTP có hiệu lực đến: " + expiresAt.format(OTP_EXPIRY_FORMATTER) + "</div>"
                + "<p style=\"color:#64748b;font-size:13px;margin-top:16px;\">Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p></div>"
                + "<div style=\"padding:16px 24px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;text-align:center;\">© " + OffsetDateTime.now().getYear() + " SnapBuy</div></div></body></html>";

        mailService.sendHtml(newEmail, subject, html);
        log.info("Đã gửi OTP xác nhận email đến {} cho tài khoản {}", newEmail, accountId);
    }

    @Override
    @Transactional
    public void verifyOtp(UUID accountId, VerifyEmailOtpRequest req) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        String otpKey = accountId + ":" + req.getNewEmail().toLowerCase();
        var rec = otpStore.get(otpKey);

        if (rec == null) {
            throw new IllegalStateException("Mã xác nhận không hợp lệ hoặc đã hết hạn");
        }

        rec.attempts++;
        if (!rec.code.equals(req.getCode())) {
            throw new IllegalStateException("Mã xác nhận không đúng");
        }

        Optional<Account> existingAccount = accountRepository.findByEmail(req.getNewEmail());
        if (existingAccount.isPresent() && !existingAccount.get().getAccountId().equals(accountId)) {
            throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác");
        }

        account.setEmail(req.getNewEmail());
        accountRepository.save(account);
        otpStore.remove(otpKey);

    }
}

