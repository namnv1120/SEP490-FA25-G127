package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.EmailVerificationRequest;
import com.g127.snapbuy.dto.request.VerifyEmailOtpRequest;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.config.OtpStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final AccountRepository accountRepository;
    private final MailService mailService;
    private final OtpStore otpStore;

    private static final DateTimeFormatter OTP_EXPIRY_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final int EXPIRE_MINUTES = 2;
    private static final int RESEND_GAP_SECONDS = 30;

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
        String content = "Xin chào " + account.getFullName() + ",\n\n"
                + "Bạn đã yêu cầu thay đổi email thành: " + newEmail + "\n\n"
                + "Mã xác nhận của bạn là: " + code + "\n"
                + "Mã có hiệu lực đến: " + expiresAt.format(OTP_EXPIRY_FORMATTER) + "\n\n"
                + "Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.";

        mailService.send(newEmail, subject, content);
        log.info("Đã gửi OTP xác nhận email đến {} cho tài khoản {}", newEmail, accountId);
    }

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

        log.info("Đã xác nhận và cập nhật email cho tài khoản {}", accountId);
    }
}
