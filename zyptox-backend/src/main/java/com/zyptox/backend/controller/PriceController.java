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

    @PostMapping("/fluctuate")
    public List<MarketPriceResponse> fluctuatePrices() {
        return priceService.fluctuatePrices();
    }
}
