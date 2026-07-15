package com.zyptox.backend.ai.dto;

import java.util.List;

public class UserContext {

    private String portfolio;

    private String marketSummary;

    private String recentTrades;

    private List<String> conversationHistory;

    public UserContext() {
    }

    public String getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(String portfolio) {
        this.portfolio = portfolio;
    }

    public String getMarketSummary() {
        return marketSummary;
    }

    public void setMarketSummary(String marketSummary) {
        this.marketSummary = marketSummary;
    }

    public String getRecentTrades() {
        return recentTrades;
    }

    public void setRecentTrades(String recentTrades) {
        this.recentTrades = recentTrades;
    }

    public List<String> getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(List<String> conversationHistory) {
        this.conversationHistory = conversationHistory;
    }
}