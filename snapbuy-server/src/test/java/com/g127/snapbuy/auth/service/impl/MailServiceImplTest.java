package com.g127.snapbuy.auth.service.impl;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private MailServiceImpl mailService;

    private String testEmail;
    private String testSubject;
    private String testContent;

    @BeforeEach
    void setUp() {
        testEmail = "test@example.com";
        testSubject = "Test Subject";
        testContent = "Test Content";
    }

    @Test
    void send_Success() {
        // Given
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When
        mailService.send(testEmail, testSubject, testContent);

        // Then
        verify(mailSender).send(argThat((SimpleMailMessage msg) ->
            testEmail.equals(msg.getTo()[0]) &&
            testSubject.equals(msg.getSubject()) &&
            testContent.equals(msg.getText())
        ));
    }

    @Test
    void send_ExceptionDuringSend_ThrowsRuntimeException() {
        // Given
        doThrow(new RuntimeException("Mail server error")).when(mailSender).send(any(SimpleMailMessage.class));

        // When & Then
        assertThrows(RuntimeException.class,
            () -> mailService.send(testEmail, testSubject, testContent));
    }

    @Test
    void sendHtml_Success() {
        // Given
        String htmlContent = "<html><body><h1>Test</h1></body></html>";
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // When
        mailService.sendHtml(testEmail, testSubject, htmlContent);

        // Then
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendHtml_ExceptionDuringSend_ThrowsRuntimeException() {
        // Given
        String htmlContent = "<html><body><h1>Test</h1></body></html>";
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Mail server error")).when(mailSender).send(any(MimeMessage.class));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> mailService.sendHtml(testEmail, testSubject, htmlContent));
        assertTrue(exception.getMessage().contains("Không thể gửi email"));
    }

    @Test
    void sendHtml_WithComplexHtml_Success() {
        // Given
        String complexHtml = """
            <!DOCTYPE html>
            <html>
            <head><title>Test Email</title></head>
            <body>
                <h1>Welcome</h1>
                <p>This is a test email with <strong>HTML</strong> content.</p>
                <a href="https://example.com">Click here</a>
            </body>
            </html>
            """;
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // When
        mailService.sendHtml(testEmail, testSubject, complexHtml);

        // Then
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void send_MultipleRecipients_Success() {
        // Given
        String recipient1 = "user1@example.com";
        String recipient2 = "user2@example.com";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When
        mailService.send(recipient1, testSubject, testContent);
        mailService.send(recipient2, testSubject, testContent);

        // Then
        verify(mailSender, times(2)).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendHtml_MultipleEmails_Success() {
        // Given
        String htmlContent = "<html><body>Test</body></html>";
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // When
        mailService.sendHtml("user1@example.com", "Subject 1", htmlContent);
        mailService.sendHtml("user2@example.com", "Subject 2", htmlContent);

        // Then
        verify(mailSender, times(2)).createMimeMessage();
        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }
}
