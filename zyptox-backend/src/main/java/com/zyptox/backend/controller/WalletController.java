package com.zyptox.backend.controller;

import com.zyptox.backend.dto.UserSession;
import com.zyptox.backend.dto.response.TransactionResponse;
import com.zyptox.backend.dto.response.WalletResponse;
import com.zyptox.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/portfolio")
    public List<WalletResponse> getPortfolio() {
        UserSession session = getSession();
        return walletService.getPortfolio(session.getId());
    }

    @GetMapping("/transactions")
    public List<TransactionResponse> getTransactions() {
        UserSession session = getSession();
        return walletService.getTransactions(session.getId());
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> getBalance() {
        UserSession session = getSession();
        BigDecimal balance = walletService.getBalance(session.getId());
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @PostMapping("/deposit")
    public ResponseEntity<Map<String, BigDecimal>> deposit(@RequestBody Map<String, BigDecimal> body) {
        UserSession session = getSession();
        BigDecimal amount = body.get("amount");
        if (amount == null) {
            throw new IllegalArgumentException("Amount is required");
        }
        BigDecimal newBalance = walletService.deposit(session.getId(), amount);
        return ResponseEntity.ok(Map.of("balance", newBalance));
    }

    private UserSession getSession() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserSession) authentication.getPrincipal();
    }
}
