package com.g127.snapbuy.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class BarcodeServiceImplTest {

    @InjectMocks
    private BarcodeServiceImpl barcodeService;

    @BeforeEach
    void setUp() {
        // No specific setup needed as BarcodeServiceImpl has no dependencies
    }

    @Test
    void generateBarcodeImage_Success() throws IOException {
        // Given
        String barcode = "1234567890";
        int width = 300;
        int height = 100;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_WithWhitespace_Success() throws IOException {
        // Given
        String barcode = "  1234567890  ";
        int width = 300;
        int height = 100;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_NullBarcode_ThrowsException() {
        // Given
        String barcode = null;
        int width = 300;
        int height = 100;

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> barcodeService.generateBarcodeImage(barcode, width, height));
    }

    @Test
    void generateBarcodeImage_EmptyBarcode_ThrowsException() {
        // Given
        String barcode = "";
        int width = 300;
        int height = 100;

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> barcodeService.generateBarcodeImage(barcode, width, height));
    }

    @Test
    void generateBarcodeImage_WhitespaceOnlyBarcode_ThrowsException() {
        // Given
        String barcode = "   ";
        int width = 300;
        int height = 100;

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> barcodeService.generateBarcodeImage(barcode, width, height));
    }

    @Test
    void generateBarcodeImage_LongBarcode_Success() throws IOException {
        // Given
        String barcode = "1234567890123456789012345";
        int width = 400;
        int height = 120;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_AlphanumericBarcode_Success() throws IOException {
        // Given
        String barcode = "ABC123XYZ";
        int width = 300;
        int height = 100;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_SmallDimensions_Success() throws IOException {
        // Given
        String barcode = "123456";
        int width = 100;
        int height = 50;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_LargeDimensions_Success() throws IOException {
        // Given
        String barcode = "1234567890";
        int width = 800;
        int height = 300;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_SpecialCharacters_Success() throws IOException {
        // Given - Code128 supports various special characters
        String barcode = "ABC-123";
        int width = 300;
        int height = 100;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_DifferentWidths_ProducesDifferentSizes() throws IOException {
        // Given
        String barcode = "1234567890";
        int height = 100;

        // When
        byte[] result1 = barcodeService.generateBarcodeImage(barcode, 200, height);
        byte[] result2 = barcodeService.generateBarcodeImage(barcode, 400, height);

        // Then
        assertNotNull(result1);
        assertNotNull(result2);
        assertNotEquals(result1.length, result2.length);
    }

    @Test
    void generateBarcodeImage_DifferentHeights_ProducesDifferentSizes() throws IOException {
        // Given
        String barcode = "1234567890";
        int width = 300;

        // When
        byte[] result1 = barcodeService.generateBarcodeImage(barcode, width, 80);
        byte[] result2 = barcodeService.generateBarcodeImage(barcode, width, 150);

        // Then
        assertNotNull(result1);
        assertNotNull(result2);
        assertNotEquals(result1.length, result2.length);
    }

    @Test
    void generateBarcodeImage_SameBarcodeMultipleTimes_ProducesSameResult() throws IOException {
        // Given
        String barcode = "1234567890";
        int width = 300;
        int height = 100;

        // When
        byte[] result1 = barcodeService.generateBarcodeImage(barcode, width, height);
        byte[] result2 = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result1);
        assertNotNull(result2);
        assertArrayEquals(result1, result2);
    }

    @Test
    void generateBarcodeImage_NumericOnly_Success() throws IOException {
        // Given
        String barcode = "9876543210";
        int width = 300;
        int height = 100;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_SingleCharacter_Success() throws IOException {
        // Given
        String barcode = "A";
        int width = 300;
        int height = 100;

        // When
        byte[] result = barcodeService.generateBarcodeImage(barcode, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
    }
}
