package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Override
    public void send(String to, String subject, String content) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(content);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Gửi email thất bại; in ra nội dung dự phòng:\nTo: {}\nSubject: {}\n{}", to, subject, content, e);
        }
    }

    @Override
    public void sendHtml(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Đã gửi email HTML thành công đến: {}", to);
        } catch (Exception e) {
            log.error("Gửi email HTML thất bại đến: {}", to, e);
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }
}


