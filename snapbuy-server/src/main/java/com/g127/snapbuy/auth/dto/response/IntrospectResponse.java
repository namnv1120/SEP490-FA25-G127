package com.g127.snapbuy.auth.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntrospectResponse {
    private boolean valid;
    private String username;
    private Long exp;
    private List<String> roles;
    private String error;
}
