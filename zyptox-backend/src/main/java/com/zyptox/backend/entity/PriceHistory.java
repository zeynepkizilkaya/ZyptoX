package com.zyptox.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "price_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_symbol", nullable = false, length = 10)
    private String assetSymbol;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal price;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}
