package com.zyptox.backend.ai.context;

import com.zyptox.backend.ai.dto.UserContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContextBuilder {

    public UserContext buildContext(Long userId) {

        UserContext context = new UserContext();

        context.setPortfolio("""
                BTC: 0.35
                ETH: 1.20
                """);

        context.setMarketSummary("""
                BTC +4.2% (24h)
                ETH -1.1% (24h)
                """);

        context.setRecentTrades("""
                BUY BTC
                SELL SOL
                """);

        context.setConversationHistory(List.of());

        return context;
    }
}