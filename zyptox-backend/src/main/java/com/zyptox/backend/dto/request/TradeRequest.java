package com.zyptox.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TradeRequest {
    @NotBlank
    private String symbol;

    @NotBlank
    @Pattern(regexp = "BUY|SELL")
    private String action;

    @NotNull
    @DecimalMin(value = "0.00000001")
    private BigDecimal amount;
}
