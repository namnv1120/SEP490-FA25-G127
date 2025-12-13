package com.g127.snapbuy.common.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.*;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "6vD1vT4FQ2a3gU9+WvJNhfR7i9j1+5sZrZT1T8iQ3xY=";
    @org.springframework.beans.factory.annotation.Value("${jwt.expiration.ms:-1}")
    private long expirationMs;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Boolean isTokenExpired(String token) {
        Date exp = extractExpiration(token);
        return exp != null && exp.before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        String jti = UUID.randomUUID().toString();
        Date now = new Date(System.currentTimeMillis());
        JwtBuilder builder = Jwts.builder()
                .setId(jti)
                .setSubject(userDetails.getUsername())
                .claim("roles", userDetails.getAuthorities())
                .setIssuedAt(now)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256);
        if (expirationMs > 0) {
            builder.setExpiration(new Date(System.currentTimeMillis() + expirationMs));
        }
        return builder.compact();
    }

    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        String jti = UUID.randomUUID().toString();
        Date now = new Date(System.currentTimeMillis());
        JwtBuilder builder = Jwts.builder()
                .setId(jti)
                .setSubject(userDetails.getUsername())
                .claim("roles", userDetails.getAuthorities())
                .addClaims(extraClaims == null ? Collections.emptyMap() : extraClaims)
                .setIssuedAt(now)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256);
        if (expirationMs > 0) {
            builder.setExpiration(new Date(System.currentTimeMillis() + expirationMs));
        }
        return builder.compact();
    }

    public Integer extractVersion(String token) {
        try {
            Claims c = extractAllClaims(token);
            Object v = c.get("ver");
            if (v instanceof Integer) return (Integer) v;
            if (v instanceof Number) return ((Number) v).intValue();
            return null;
        } catch (Exception e) {
            return null;
        }
    }
    
    public String extractTenantId(String token) {
        try {
            Claims c = extractAllClaims(token);
            Object tenantId = c.get("tenantId");
            return tenantId != null ? tenantId.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    public String extractType(String token) {
        try {
            Claims c = extractAllClaims(token);
            Object type = c.get("type");
            return type != null ? type.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
