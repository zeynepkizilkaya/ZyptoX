package com.zyptox.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradeResponse {
    private String status; // SUCCESS or FAILED
    private String message;
    private BigDecimal balance;
}
