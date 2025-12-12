package com.g127.snapbuy.tenant.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TenantResolver {

    /**
     * Extract tenant code from subdomain
     * Examples:
     * - shop1.snapbuy.com -> shop1
     * - localhost:8080 -> null (fallback to tenantCode in request body)
     * - 192.168.1.100:8080 -> null
     */
    public static String resolveFromSubdomain(HttpServletRequest request) {
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isEmpty()) {
            host = request.getHeader("Host");
        }
        
        if (host == null || host.isEmpty()) {
            log.warn("No Host header found in request");
            return null;
        }
        
        // Remove port if present
        host = host.split(":")[0];
        
        // Check if it's localhost or IP address
        if (host.equals("localhost") || host.matches("^\\d+\\.\\d+\\.\\d+\\.\\d+$")) {
            log.debug("Request from localhost or IP address, cannot extract subdomain");
            return null;
        }
        
        // Extract subdomain
        String[] parts = host.split("\\.");
        if (parts.length >= 3) {
            // shop1.snapbuy.com -> shop1
            String subdomain = parts[0];
            log.debug("Extracted tenant code from subdomain: {}", subdomain);
            return subdomain;
        }
        
        log.debug("No subdomain found in host: {}", host);
        return null;
    }
}
