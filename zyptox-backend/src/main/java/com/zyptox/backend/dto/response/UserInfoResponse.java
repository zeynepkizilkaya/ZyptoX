package com.zyptox.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private String username;
    private BigDecimal balance;
    private String token;
}
