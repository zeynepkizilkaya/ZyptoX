package com.zyptox.backend.controller;

import com.zyptox.backend.dto.response.MarketPriceResponse;
import com.zyptox.backend.service.PriceService;
import com.zyptox.backend.ai.config.GeminiConfig;
import com.zyptox.backend.ai.service.AIChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class PriceController {

    private final PriceService priceService;
    private final GeminiConfig geminiConfig;

    @GetMapping("/debug")
    public Map<String, Object> debugGemini() {
        Map<String, Object> debugInfo = new HashMap<>();
        String key = geminiConfig.getApiKey();
        if (key != null && key.length() > 15) {
            debugInfo.put("apiKeyMasked", key.substring(0, 10) + "..." + key.substring(key.length() - 5));
            debugInfo.put("apiKeyLength", key.length());
        } else {
            debugInfo.put("apiKeyMasked", key);
        }
        debugInfo.put("model", geminiConfig.getModel());
        debugInfo.put("lastError", AIChatService.lastError);
        return debugInfo;
    }

    @GetMapping
    public List<MarketPriceResponse> getPrices() {
        return priceService.getPrices();
    }

    @GetMapping("/{symbol}")
    public MarketPriceResponse getPrice(@PathVariable String symbol) {
        return priceService.getPrice(symbol);
    }

    @GetMapping("/{symbol}/klines")
    public List<List<Object>> getKlines(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1h") String interval,
            @RequestParam(defaultValue = "24") Integer limit) {
        return priceService.getKlines(symbol, interval, limit);
    }

    @PostMapping("/fluctuate")
    public List<MarketPriceResponse> fluctuatePrices() {
        return priceService.getPrices();
    }
}
