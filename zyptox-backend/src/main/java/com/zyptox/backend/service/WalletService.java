package com.zyptox.backend.service;

import com.zyptox.backend.dto.response.TransactionResponse;
import com.zyptox.backend.dto.response.WalletResponse;
import com.zyptox.backend.entity.Transaction;
import com.zyptox.backend.entity.User;
import com.zyptox.backend.entity.Wallet;
import com.zyptox.backend.repository.TransactionRepository;
import com.zyptox.backend.repository.UserRepository;
import com.zyptox.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PriceService priceService;

    public List<WalletResponse> getPortfolio(Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        List<WalletResponse> responses = new ArrayList<>();

        for (Wallet wallet : wallets) {
            String symbol = wallet.getAssetSymbol();
            String name = priceService.getAssetName(symbol);
            BigDecimal avgBuyPrice = calculateAvgBuyPrice(userId, symbol);

            responses.add(new WalletResponse(
                    symbol,
                    name,
                    wallet.getAmount(),
                    avgBuyPrice
            ));
        }

        return responses;
    }

    public List<TransactionResponse> getTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByExecutedAtDesc(userId);
        List<TransactionResponse> responses = new ArrayList<>();

        for (Transaction tx : transactions) {
            BigDecimal total = tx.getVolume().multiply(tx.getPrice()).setScale(2, RoundingMode.HALF_UP);
            responses.add(new TransactionResponse(
                    tx.getId(),
                    tx.getExecutedAt().toString(),
                    tx.getAssetSymbol(),
                    tx.getType(),
                    tx.getVolume(),
                    tx.getPrice(),
                    total
            ));
        }

        return responses;
    }

    public BigDecimal getBalance(Long userId) {
        return userRepository.findById(userId)
                .map(User::getBalance)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public BigDecimal deposit(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setBalance(user.getBalance().add(amount).setScale(8, RoundingMode.HALF_UP));
        userRepository.save(user);

        return user.getBalance();
    }

    private BigDecimal calculateAvgBuyPrice(Long userId, String symbol) {
        List<Transaction> txs = transactionRepository.findByUserIdOrderByExecutedAtDesc(userId);
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalVolume = BigDecimal.ZERO;

        for (Transaction tx : txs) {
            if (tx.getAssetSymbol().equalsIgnoreCase(symbol) && "BUY".equalsIgnoreCase(tx.getType())) {
                BigDecimal cost = tx.getVolume().multiply(tx.getPrice());
                totalCost = totalCost.add(cost);
                totalVolume = totalVolume.add(tx.getVolume());
            }
        }

        if (totalVolume.compareTo(BigDecimal.ZERO) == 0) {
            try {
                return priceService.getPrice(symbol).getPrice();
            } catch (Exception e) {
                return BigDecimal.ZERO;
            }
        }

        return totalCost.divide(totalVolume, 8, RoundingMode.HALF_UP);
    }
}
