package com.zyptox.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 4)
    private String type; // BUY or SELL

    @Column(name = "asset_symbol", nullable = false, length = 10)
    private String assetSymbol;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal volume;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal price;

    @Column(name = "executed_at", nullable = false)
    private Instant executedAt;
}
