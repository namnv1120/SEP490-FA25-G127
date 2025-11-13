package com.g127.snapbuy.service;

public interface MailService {
    void send(String to, String subject, String content);
    void sendHtml(String to, String subject, String htmlContent);
}
