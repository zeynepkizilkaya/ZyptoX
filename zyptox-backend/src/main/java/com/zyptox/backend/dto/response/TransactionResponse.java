package com.zyptox.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String timestamp;
    private String symbol;
    private String type; // BUY or SELL
    private BigDecimal amount;
    private BigDecimal price;
    private BigDecimal total;
}
