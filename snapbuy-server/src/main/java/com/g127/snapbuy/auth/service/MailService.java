package com.g127.snapbuy.auth.service;

public interface MailService {
    void send(String to, String subject, String content);
    void sendHtml(String to, String subject, String htmlContent);
}
