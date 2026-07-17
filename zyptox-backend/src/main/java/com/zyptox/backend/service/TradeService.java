package com.zyptox.backend.service;

import com.zyptox.backend.dto.response.MarketPriceResponse;
import com.zyptox.backend.dto.response.TradeResponse;
import com.zyptox.backend.entity.Transaction;
import com.zyptox.backend.entity.User;
import com.zyptox.backend.entity.Wallet;
import com.zyptox.backend.exception.InsufficientFundsException;
import com.zyptox.backend.repository.TransactionRepository;
import com.zyptox.backend.repository.UserRepository;
import com.zyptox.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PriceService priceService;

    @Transactional
    public TradeResponse executeTrade(Long userId, String symbol, String action, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String upperSymbol = symbol.toUpperCase();
        MarketPriceResponse priceResponse = priceService.getPrice(upperSymbol);
        BigDecimal currentPrice = priceResponse.getPrice();

        BigDecimal totalValue = currentPrice.multiply(amount).setScale(8, RoundingMode.HALF_UP);

        if ("BUY".equalsIgnoreCase(action)) {
            if (user.getBalance().compareTo(totalValue) < 0) {
                throw new InsufficientFundsException("Insufficient funds to complete this trade.");
            }

            // Deduct balance
            user.setBalance(user.getBalance().subtract(totalValue).setScale(8, RoundingMode.HALF_UP));
            userRepository.save(user);

            // Update wallet
            Wallet wallet = walletRepository.findByUserIdAndAssetSymbol(userId, upperSymbol)
                    .orElseGet(() -> Wallet.builder()
                            .user(user)
                            .assetSymbol(upperSymbol)
                            .amount(BigDecimal.ZERO)
                            .build());

            wallet.setAmount(wallet.getAmount().add(amount).setScale(8, RoundingMode.HALF_UP));
            walletRepository.save(wallet);

            // Log transaction
            Transaction tx = Transaction.builder()
                    .user(user)
                    .type("BUY")
                    .assetSymbol(upperSymbol)
                    .volume(amount)
                    .price(currentPrice)
                    .executedAt(Instant.now())
                    .build();
            transactionRepository.save(tx);

            return new TradeResponse(
                    "SUCCESS",
                    "Successfully executed BUY order for " + amount + " " + upperSymbol + ".",
                    user.getBalance()
            );

        } else if ("SELL".equalsIgnoreCase(action)) {
            Wallet wallet = walletRepository.findByUserIdAndAssetSymbol(userId, upperSymbol)
                    .orElseThrow(() -> new InsufficientFundsException("You do not hold any " + upperSymbol + " to sell."));

            if (wallet.getAmount().compareTo(amount) < 0) {
                throw new InsufficientFundsException("You do not hold enough " + upperSymbol + " to sell.");
            }

            // Add balance
            user.setBalance(user.getBalance().add(totalValue).setScale(8, RoundingMode.HALF_UP));
            userRepository.save(user);

            // Update wallet
            BigDecimal newAmount = wallet.getAmount().subtract(amount).setScale(8, RoundingMode.HALF_UP);
            if (newAmount.compareTo(BigDecimal.ZERO) <= 0) {
                walletRepository.delete(wallet);
            } else {
                wallet.setAmount(newAmount);
                walletRepository.save(wallet);
            }

            // Log transaction
            Transaction tx = Transaction.builder()
                    .user(user)
                    .type("SELL")
                    .assetSymbol(upperSymbol)
                    .volume(amount)
                    .price(currentPrice)
                    .executedAt(Instant.now())
                    .build();
            transactionRepository.save(tx);

            return new TradeResponse(
                    "SUCCESS",
                    "Successfully executed SELL order for " + amount + " " + upperSymbol + ".",
                    user.getBalance()
            );
        } else {
            throw new IllegalArgumentException("Invalid action: " + action);
        }
    }
}
