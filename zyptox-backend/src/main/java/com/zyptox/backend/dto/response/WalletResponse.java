package com.zyptox.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private String symbol;
    private String name;
    private BigDecimal amount;
    private BigDecimal avgBuyPrice;
}
