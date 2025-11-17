package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.service.BarcodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class BarcodeServiceImpl implements BarcodeService {

    @Override
    public byte[] generateBarcodeImage(String barcode, int width, int height) throws IOException {
        if (barcode == null || barcode.trim().isEmpty()) {
            throw new IllegalArgumentException("Barcode cannot be empty");
        }

        try {
            Code128Writer writer = new Code128Writer();
            BitMatrix bitMatrix = writer.encode(barcode.trim(), BarcodeFormat.CODE_128, width, height);

            MatrixToImageConfig config = new MatrixToImageConfig(0xFF000000, 0xFFFFFFFF);
            BufferedImage barcodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix, config);

            int textHeight = 35; // Tăng chiều cao cho text
            int fontSize = 16;
            int horizontalPadding = 10; // Padding ngang để text không bị cắt
            
            int finalWidth = barcodeImage.getWidth() + (horizontalPadding * 2);
            BufferedImage finalImage = new BufferedImage(
                finalWidth, 
                barcodeImage.getHeight() + textHeight, 
                BufferedImage.TYPE_INT_RGB
            );
            
            Graphics2D g2d = finalImage.createGraphics();
            
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, finalImage.getWidth(), finalImage.getHeight());
            
            int barcodeX = (finalImage.getWidth() - barcodeImage.getWidth()) / 2;
            g2d.drawImage(barcodeImage, barcodeX, 0, null);
            
            g2d.setColor(Color.BLACK);
            g2d.setFont(new Font("Arial", Font.PLAIN, fontSize));
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            
            FontMetrics fm = g2d.getFontMetrics();
            String barcodeText = barcode.trim();
            int textWidth = fm.stringWidth(barcodeText);
            int x = (finalImage.getWidth() - textWidth) / 2;
            int y = barcodeImage.getHeight() + textHeight - 8; // Điều chỉnh vị trí y
            
            if (textWidth > finalImage.getWidth() - (horizontalPadding * 2)) {
                float scale = (float)(finalImage.getWidth() - (horizontalPadding * 2)) / textWidth;
                fontSize = (int)(fontSize * scale * 0.9); // Giảm thêm 10% để có margin
                g2d.setFont(new Font("Arial", Font.PLAIN, fontSize));
                fm = g2d.getFontMetrics();
                textWidth = fm.stringWidth(barcodeText);
                x = (finalImage.getWidth() - textWidth) / 2;
            }
            
            g2d.drawString(barcodeText, x, y);
            g2d.dispose();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(finalImage, "PNG", outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new IOException("Failed to generate barcode", e);
        }
    }
}

