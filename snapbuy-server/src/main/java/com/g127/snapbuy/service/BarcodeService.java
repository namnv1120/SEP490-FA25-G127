package com.g127.snapbuy.service;

import java.io.IOException;

public interface BarcodeService {
    byte[] generateBarcodeImage(String barcode, int width, int height) throws IOException;
}

