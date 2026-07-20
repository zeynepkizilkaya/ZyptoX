package com.zyptox.backend.controller;

import com.zyptox.backend.dto.response.MarketPriceResponse;
import com.zyptox.backend.service.PriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class PriceController {

    private final PriceService priceService;

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
