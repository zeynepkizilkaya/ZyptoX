package com.zyptox.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketPriceResponse {
    private String symbol;
    private String name;
    private BigDecimal price;
    private BigDecimal change24h;
    private List<BigDecimal> sparkline;
}
