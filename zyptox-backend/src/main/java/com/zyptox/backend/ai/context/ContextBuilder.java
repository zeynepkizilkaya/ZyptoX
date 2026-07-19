package com.zyptox.backend.ai.context;

import com.zyptox.backend.ai.dto.UserContext;
import com.zyptox.backend.ai.service.ConversationMemoryService;
import com.zyptox.backend.dto.response.MarketPriceResponse;
import com.zyptox.backend.entity.Transaction;
import com.zyptox.backend.entity.User;
import com.zyptox.backend.entity.Wallet;
import com.zyptox.backend.repository.TransactionRepository;
import com.zyptox.backend.repository.UserRepository;
import com.zyptox.backend.repository.WalletRepository;
import com.zyptox.backend.service.PriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ContextBuilder {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PriceService priceService;
    private final ConversationMemoryService conversationMemoryService;

    public UserContext buildContext(Long userId) {
        UserContext context = new UserContext();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            context.setPortfolio("User not found.");
            context.setMarketSummary("Market data unavailable.");
            context.setRecentTrades("No recent trades.");
            context.setConversationHistory(List.of());
            return context;
        }

        // 1. Build Portfolio String
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        StringBuilder portfolioBuilder = new StringBuilder();
        portfolioBuilder.append(
                String.format("USD Cash Balance: $%.2f%n", user.getBalance().doubleValue()));
        if (wallets.isEmpty()) {
            portfolioBuilder.append("No cryptocurrency holdings.");
        } else {
            for (Wallet w : wallets) {
                portfolioBuilder
                        .append(String.format("- %s: %s units\n", w.getAssetSymbol(), w.getAmount().toString()));
            }
        }
        context.setPortfolio(portfolioBuilder.toString());

        // 2. Build Market Summary String
        List<MarketPriceResponse> prices = priceService.getPrices();
        StringBuilder marketBuilder = new StringBuilder();
        for (MarketPriceResponse p : prices) {
            marketBuilder.append(String.format( "- %s (%s): $%s (%s%% 24h change)\n", 

    p.getSymbol(),  p.getName(),  p.getPrice().toString(),  p.getChange24h().toString() ));
        }
        context.setMarketSummary(marketBuilder.toString());

        // 3. Build Recent Trades String
        List<Transaction> txs = transactionRepository.findByUserIdOrderByExecutedAtDesc(userId);
        StringBuilder txBuilder = new StringBuilder();
        if (txs.isEmpty()) {
            txBuilder.append("No transaction history.");
        } else {
            // Keep last 10 trades to prevent prompt size explosion
            List<Transaction> recent = txs.stream().limit(10).toList();
            for (Transaction tx : recent) {
                txBuilder.append(String.format("- %s %s %s units at $%s executed at %s\n",
                        tx.getType(), tx.getVolume().toString(), tx.getAssetSymbol(), String.format("%.2f", tx.getPrice().doubleValue()),
                        tx.getExecutedAt().toString()));
            }
        }
        context.setRecentTrades(txBuilder.toString());

        context.setConversationHistory(
                conversationMemoryService.getConversation(userId));

        return context;
    }
}