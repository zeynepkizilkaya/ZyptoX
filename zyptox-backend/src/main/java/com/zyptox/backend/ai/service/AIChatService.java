package com.zyptox.backend.ai.service;

import com.zyptox.backend.ai.client.GeminiClient;
import com.zyptox.backend.ai.context.ContextBuilder;
import com.zyptox.backend.ai.dto.ChatResponse;
import com.zyptox.backend.ai.dto.UserContext;
import com.zyptox.backend.ai.dto.gemini.GeminiResponse;
import com.zyptox.backend.ai.parser.ResponseParser;
import com.zyptox.backend.ai.prompt.PromptBuilder;
import com.zyptox.backend.service.PriceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.zyptox.backend.ai.security.InputGuard;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class AIChatService {

    private final ContextBuilder contextBuilder;
    private final PromptBuilder promptBuilder;
    private final GeminiClient geminiClient;
    private final ResponseParser responseParser;
    private final InputGuard inputGuard;
    private final ConversationMemoryService conversationMemoryService;
    private final PriceService priceService;
    

    public AIChatService(
            ContextBuilder contextBuilder,
            PromptBuilder promptBuilder,
            GeminiClient geminiClient,
            InputGuard inputGuard,
            ConversationMemoryService conversationMemoryService,
            ResponseParser responseParser,
            PriceService priceService) {

        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.geminiClient = geminiClient;
        this.responseParser = responseParser;
        this.inputGuard = inputGuard;
        this.conversationMemoryService = conversationMemoryService;
        this.priceService = priceService;
    }

    public static volatile String lastError = "No errors recorded yet";

    public ChatResponse chat(Long userId, String message) {
        if (!inputGuard.isAllowed(message)) {
    return new ChatResponse(
            "For security reasons, I cannot process that request."
    );
}
        UserContext context = null;
        conversationMemoryService.addUserMessage(userId, message);
        try {
            context = contextBuilder.buildContext(userId);
            String prompt = promptBuilder.buildPrompt(context, message);
            GeminiResponse response = geminiClient.generateResponse(prompt);
            String answer = responseParser.parse(response);
            conversationMemoryService.addAssistantMessage(userId, answer);
            return new ChatResponse(answer);
        } catch (Exception e) {
            lastError = e.toString() + (e.getCause() != null ? " | Cause: " + e.getCause().toString() : "");
            log.error("Gemini AI API execution failed. Returning fallback mock response.", e);
            // Fallback response if Gemini fails or is rate limited
            if (context == null) {
                context = new UserContext();
                context.setPortfolio("USD Cash Balance: $0.00\nNo cryptocurrency holdings.");
                context.setRecentTrades("No transaction history.");
                context.setMarketSummary("");
            }
            return new ChatResponse(getFallbackResponse(message, context));
        }
    }

    private String getFallbackResponse(String message, UserContext context) {
        String query = message.toLowerCase();
        boolean isTurkish = query.contains("portföy") || query.contains("varlık") || query.contains("bakiye") 
                || query.contains("nasılsın") || query.contains("merhaba") || query.contains("selam") 
                || query.contains("işlem") || query.contains("al") || query.contains("sat")
                || query.contains("yenile") || query.contains("nasıl") || query.contains("kim")
                || message.matches(".*[ıİşŞğĞçÇöÖüÜ].*");

        // 1. Greet responses
        if (query.contains("merhaba") || query.contains("selam") || query.contains("nasılsın") || query.contains("hello") || query.contains("hi ")) {
            if (isTurkish) {
                return "### 👋 Merhaba!\n\nBen sizin ZyptoX Yapay Zeka Finansal Asistanınızım. Portföyünüzü analiz edebilir, son işlemlerinizi listeleyebilir veya güncel kripto fiyatları hakkında bilgi verebilirim. Nasıl yardımcı olabilirim?";
            } else {
                return "### 👋 Hello!\n\nI am your ZyptoX AI Financial Advisor. I can analyze your portfolio, review your recent trades, or check market prices. How can I help you today?";
            }
        }

        // 2. Price lookup responses
        String targetSymbol = null;
        if (query.contains("btc") || query.contains("bitcoin")) targetSymbol = "BTC";
        else if (query.contains("eth") || query.contains("ethereum")) targetSymbol = "ETH";
        else if (query.contains("sol") || query.contains("solana")) targetSymbol = "SOL";
        else if (query.contains("bnb")) targetSymbol = "BNB";
        else if (query.contains("doge")) targetSymbol = "DOGE";
        
        if (targetSymbol != null) {
            String marketSummary = context.getMarketSummary();
            Pattern p = Pattern.compile("- " + targetSymbol + " \\(([^\\)]+)\\): \\$([^ ]+) \\(([^ ]+) 24h change\\)");
            Matcher m = p.matcher(marketSummary);
            if (m.find()) {
                String name = m.group(1);
                String price = m.group(2);
                String change = m.group(3);

                // Check if user requested 1-week or 7-day trend analysis
                if (query.contains("week") || query.contains("hafta") || query.contains("yedi gün") || query.contains("7 gün") || query.contains("trend")) {
                    try {
                        List<List<Object>> klines = priceService.getKlines(targetSymbol, "1d", 7);
                        if (klines != null && klines.size() >= 5) {
                            BigDecimal startPrice = new BigDecimal(klines.get(0).get(1).toString());
                            BigDecimal endPrice = new BigDecimal(klines.get(klines.size() - 1).get(4).toString());
                            BigDecimal weekChange = endPrice.subtract(startPrice)
                                    .divide(startPrice, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100));

                            BigDecimal highest = BigDecimal.ZERO;
                            BigDecimal lowest = BigDecimal.valueOf(999999999);
                            for (List<Object> k : klines) {
                                BigDecimal h = new BigDecimal(k.get(2).toString());
                                BigDecimal l = new BigDecimal(k.get(3).toString());
                                if (h.compareTo(highest) > 0) highest = h;
                                if (l.compareTo(lowest) < 0) lowest = l;
                            }

                            String trendIndicator = weekChange.compareTo(BigDecimal.ZERO) >= 0 ? "📈 YÜKSELİŞ" : "📉 DÜŞÜŞ";
                            String trendIndicatorEn = weekChange.compareTo(BigDecimal.ZERO) >= 0 ? "📈 BULLISH" : "📉 BEARISH";

                            if (isTurkish) {
                                return String.format(
                                        "### 📊 %s (%s) Son 1 Haftalık (7 Günlük) Performans Analizi\n\n" +
                                        "- **Güncel Fiyat**: $%s\n" +
                                        "- **1 Hafta Önceki Fiyat**: $%s\n" +
                                        "- **Haftalık Net Değişim**: %s%%\n" +
                                        "- **Haftalık En Yüksek Seviye**: $%s\n" +
                                        "- **Haftalık En Düşük Seviye**: $%s\n" +
                                        "- **Genel Trend Görünümü**: **%s**\n\n" +
                                        "Bu veriler Binance API üzerinden gerçek zamanlı günlük mum verileri (klines) tünellenerek hesaplanmıştır.",
                                        targetSymbol, name, endPrice.setScale(2, RoundingMode.HALF_UP), startPrice.setScale(2, RoundingMode.HALF_UP),
                                        weekChange.setScale(2, RoundingMode.HALF_UP), highest.setScale(2, RoundingMode.HALF_UP), lowest.setScale(2, RoundingMode.HALF_UP), trendIndicator
                                );
                            } else {
                                return String.format(
                                        "### 📊 %s (%s) Last 1 Week (7 Days) Performance Analysis\n\n" +
                                        "- **Current Price**: $%s\n" +
                                        "- **Price 7 Days Ago**: $%s\n" +
                                        "- **Weekly Net Change**: %s%%\n" +
                                        "- **Weekly High**: $%s\n" +
                                        "- **Weekly Low**: $%s\n" +
                                        "- **Overall Trend**: **%s**\n\n" +
                                        "These metrics are computed in real-time from daily candles via Binance API.",
                                        targetSymbol, name, endPrice.setScale(2, RoundingMode.HALF_UP), startPrice.setScale(2, RoundingMode.HALF_UP),
                                        weekChange.setScale(2, RoundingMode.HALF_UP), highest.setScale(2, RoundingMode.HALF_UP), lowest.setScale(2, RoundingMode.HALF_UP), trendIndicatorEn
                                );
                            }
                        }
                    } catch (Exception e) {
                        log.error("Failed to build weekly fallback analysis for " + targetSymbol, e);
                    }
                }

                if (isTurkish) {
                    return String.format("### 📈 %s (%s) Fiyat Bilgisi\n\n- **Güncel Fiyat**: $%s\n- **24 Saatlik Değişim**: %s\n\nAl-Sat sekmesini kullanarak bu fiyattan emir gerçekleştirebilirsiniz.", targetSymbol, name, price, change);
                } else {
                    return String.format("### 📈 %s (%s) Price Info\n\n- **Current Price**: $%s\n- **24h Change**: %s\n\nYou can place buy or sell orders at this rate on the Trade tab.", targetSymbol, name, price, change);
                }
            }
        }

        // 3. Transaction history responses
        if (query.contains("history") || query.contains("geçmiş") || query.contains("işlem") || query.contains("transaction")) {
            String rawTxs = context.getRecentTrades();
            
            if (isTurkish) {
                StringBuilder sb = new StringBuilder();
                sb.append("### 📜 Son İşlem Geçmişiniz\n\n");
                sb.append("Hesabınız üzerinden gerçekleştirilen son Al-Sat işlemleri şu şekildedir:\n\n");
                if (rawTxs.contains("No transaction history") || rawTxs.trim().isEmpty()) {
                    sb.append("- Henüz yapılmış bir işleminiz bulunmuyor.\n");
                } else {
                    String[] txLines = rawTxs.split("\n");
                    for (int i = 0; i < Math.min(txLines.length, 5); i++) {
                        sb.append(txLines[i]).append("\n");
                    }
                }
                return sb.toString();
            } else {
                StringBuilder sb = new StringBuilder();
                sb.append("### 📜 Recent Transaction History\n\n");
                sb.append("Here are the latest buy and sell transactions executed on your account:\n\n");
                if (rawTxs.contains("No transaction history") || rawTxs.trim().isEmpty()) {
                    sb.append("- No transactions executed yet.\n");
                } else {
                    String[] txLines = rawTxs.split("\n");
                    for (int i = 0; i < Math.min(txLines.length, 5); i++) {
                        sb.append(txLines[i]).append("\n");
                    }
                }
                return sb.toString();
            }
        }

        // 4. Portfolio analysis responses
        if (query.contains("portfolio") || query.contains("portföy") || query.contains("varlık") || query.contains("bakiye") || query.contains("analiz")) {
            String rawPortfolio = context.getPortfolio();
            
            if (isTurkish) {
                StringBuilder sb = new StringBuilder();
                sb.append("### 📊 Portföy Analiz Özeti\n\n");
                sb.append("Portföyünüzün simüle edilmiş son durumu şu şekildedir:\n\n");
                sb.append("**Nakit Durumu**:\n");
                
                // Parse cash balance
                String cash = "0.00";
                Pattern p = Pattern.compile("USD Cash Balance: \\$(.*)");
                Matcher m = p.matcher(rawPortfolio);
                if (m.find()) {
                    cash = m.group(1).trim();
                }
                sb.append("- **USD Nakit**: $").append(cash).append("\n\n");
                
                sb.append("**Kripto Varlıkları**:\n");
                String[] lines = rawPortfolio.split("\n");
                boolean hasCrypto = false;
                for (String line : lines) {
                    if (line.startsWith("- ")) {
                        sb.append(line.replace("- ", "- **").replace(": ", "**: ")).append("\n");
                        hasCrypto = true;
                    }
                }
                if (!hasCrypto) {
                    sb.append("- Cüzdanınızda henüz kripto varlık bulunmuyor.\n");
                }
                return sb.toString();
            } else {
                StringBuilder sb = new StringBuilder();
                sb.append("### 📊 Portfolio Analysis Summary\n\n");
                sb.append("Here is the current status of your simulated portfolio:\n\n");
                sb.append("**Cash Balance**:\n");
                
                String cash = "0.00";
                Pattern p = Pattern.compile("USD Cash Balance: \\$(.*)");
                Matcher m = p.matcher(rawPortfolio);
                if (m.find()) {
                    cash = m.group(1).trim();
                }
                sb.append("- **USD Cash**: $").append(cash).append("\n\n");
                
                sb.append("**Crypto Holdings**:\n");
                String[] lines = rawPortfolio.split("\n");
                boolean hasCrypto = false;
                for (String line : lines) {
                    if (line.startsWith("- ")) {
                        sb.append(line.replace("- ", "- **").replace(": ", "**: ")).append("\n");
                        hasCrypto = true;
                    }
                }
                if (!hasCrypto) {
                    sb.append("- No cryptocurrency holdings found.\n");
                }
                return sb.toString();
            }
        }

        // 4. Default fallback
        if (isTurkish) {
            return "### 🤖 ZyptoX Asistanı\n\n" +
                    "Şu anda asistan servislerimiz geçici olarak yanıt veremiyor. Ancak, cüzdanınız ve Al-Sat işlemleriniz tamamen aktiftir.\n\n" +
                    "**Yardım alabileceğiniz konular**:\n" +
                    "- Portföy durumunuzu görmek için: *\"Portföyümü analiz et\"* yazabilirsiniz.\n" +
                    "- Belirli coin fiyatlarını sorgulamak için: *\"BTC fiyatı nedir?\"* yazabilirsiniz.";
        } else {
            return "### 🤖 ZyptoX Advisor\n\n" +
                    "Our advisor services are currently offline, but your simulated trading dashboard is fully active.\n\n" +
                    "**Available topics**:\n" +
                    "- To review holdings: type *\"Analyze my portfolio\"*\n" +
                    "- To view token rates: type *\"What is the price of BTC?\"*";
        }
    }
}