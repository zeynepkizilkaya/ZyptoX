package com.zyptox.backend.ai.service;

import com.zyptox.backend.ai.client.GeminiClient;
import com.zyptox.backend.ai.context.ContextBuilder;
import com.zyptox.backend.ai.dto.ChatResponse;
import com.zyptox.backend.ai.dto.UserContext;
import com.zyptox.backend.ai.dto.gemini.GeminiResponse;
import com.zyptox.backend.ai.parser.ResponseParser;
import com.zyptox.backend.ai.prompt.PromptBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class AIChatService {

    private final ContextBuilder contextBuilder;
    private final PromptBuilder promptBuilder;
    private final GeminiClient geminiClient;
    private final ResponseParser responseParser;

    public AIChatService(
            ContextBuilder contextBuilder,
            PromptBuilder promptBuilder,
            GeminiClient geminiClient,
            ResponseParser responseParser) {

        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
        this.geminiClient = geminiClient;
        this.responseParser = responseParser;
    }

    public ChatResponse chat(Long userId, String message) {
        UserContext context = null;
        try {
            context = contextBuilder.buildContext(userId);
            String prompt = promptBuilder.buildPrompt(context, message);
            GeminiResponse response = geminiClient.generateResponse(prompt);
            String answer = responseParser.parse(response);
            return new ChatResponse(answer);
        } catch (Exception e) {
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