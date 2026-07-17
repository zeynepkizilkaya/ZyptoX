package com.zyptox.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zyptox.backend.dto.response.MarketPriceResponse;
import com.zyptox.backend.entity.PriceHistory;
import com.zyptox.backend.exception.AssetNotFoundException;
import com.zyptox.backend.repository.PriceHistoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final PriceHistoryRepository priceHistoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String REDIS_KEY_PREFIX = "market:price:";
    
    private static final Map<String, String> ASSET_NAMES = new LinkedHashMap<>();
    private static final Map<String, BigDecimal> INITIAL_PRICES = new HashMap<>();

    static {
        ASSET_NAMES.put("BTC", "Bitcoin");
        ASSET_NAMES.put("ETH", "Ethereum");
        ASSET_NAMES.put("SOL", "Solana");
        ASSET_NAMES.put("BNB", "BNB");
        ASSET_NAMES.put("XRP", "Ripple");
        ASSET_NAMES.put("ADA", "Cardano");
        ASSET_NAMES.put("DOT", "Polkadot");
        ASSET_NAMES.put("DOGE", "Dogecoin");
        ASSET_NAMES.put("AVAX", "Avalanche");
        ASSET_NAMES.put("LINK", "Chainlink");

        INITIAL_PRICES.put("BTC", BigDecimal.valueOf(62500.00));
        INITIAL_PRICES.put("ETH", BigDecimal.valueOf(3450.00));
        INITIAL_PRICES.put("SOL", BigDecimal.valueOf(142.50));
        INITIAL_PRICES.put("BNB", BigDecimal.valueOf(575.00));
        INITIAL_PRICES.put("XRP", BigDecimal.valueOf(0.59));
        INITIAL_PRICES.put("ADA", BigDecimal.valueOf(0.38));
        INITIAL_PRICES.put("DOT", BigDecimal.valueOf(6.15));
        INITIAL_PRICES.put("DOGE", BigDecimal.valueOf(0.12));
        INITIAL_PRICES.put("AVAX", BigDecimal.valueOf(26.80));
        INITIAL_PRICES.put("LINK", BigDecimal.valueOf(13.90));
    }

    @PostConstruct
    public void init() {
        for (String symbol : ASSET_NAMES.keySet()) {
            String key = REDIS_KEY_PREFIX + symbol;
            if (Boolean.FALSE.equals(redisTemplate.hasKey(key))) {
                BigDecimal initialPrice = INITIAL_PRICES.get(symbol);
                List<BigDecimal> sparkline = new ArrayList<>();
                // Generate a mock initial sparkline of 7 points
                for (int i = 6; i >= 0; i--) {
                    double pct = (new Random().nextDouble() * 2.0 - 1.0) / 100.0;
                    sparkline.add(initialPrice.multiply(BigDecimal.valueOf(1 + pct)).setScale(2, RoundingMode.HALF_UP));
                }
                MarketPriceResponse priceResponse = new MarketPriceResponse(
                        symbol,
                        ASSET_NAMES.get(symbol),
                        initialPrice,
                        BigDecimal.ZERO,
                        sparkline
                );
                savePriceToRedis(symbol, priceResponse);
                
                // Save initial history to DB if empty
                if (priceHistoryRepository.findTopByAssetSymbolOrderByRecordedAtDesc(symbol).isEmpty()) {
                    priceHistoryRepository.save(PriceHistory.builder()
                            .assetSymbol(symbol)
                            .price(initialPrice)
                            .recordedAt(Instant.now())
                            .build());
                }
            }
        }
    }

    @Scheduled(fixedRate = 15000)
    public void scheduledFluctuation() {
        log.info("Running scheduled market price fluctuation");
        List<MarketPriceResponse> updated = fluctuatePrices();
        // Persist price snapshots to database for historical charts
        for (MarketPriceResponse price : updated) {
            try {
                priceHistoryRepository.save(PriceHistory.builder()
                        .assetSymbol(price.getSymbol())
                        .price(price.getPrice())
                        .recordedAt(Instant.now())
                        .build());
            } catch (Exception e) {
                log.error("Failed to save price history for " + price.getSymbol(), e);
            }
        }
    }

    public List<MarketPriceResponse> fluctuatePrices() {
        List<MarketPriceResponse> updatedList = new ArrayList<>();
        Random random = new Random();

        for (String symbol : ASSET_NAMES.keySet()) {
            MarketPriceResponse current = getPriceFromRedis(symbol);
            if (current == null) {
                continue;
            }

            double pct = (random.nextDouble() * 2.4 - 1.2) / 100.0; // ±1.2%
            BigDecimal oldPrice = current.getPrice();
            BigDecimal newPrice = oldPrice.multiply(BigDecimal.valueOf(1 + pct));
            
            // Adjust scale based on price size
            if (newPrice.compareTo(BigDecimal.ONE) < 0) {
                newPrice = newPrice.setScale(6, RoundingMode.HALF_UP);
            } else {
                newPrice = newPrice.setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal changePct = current.getChange24h().add(BigDecimal.valueOf(pct * 100)).setScale(2, RoundingMode.HALF_UP);

            List<BigDecimal> sparkline = new ArrayList<>(current.getSparkline());
            if (!sparkline.isEmpty()) {
                sparkline.remove(0);
            }
            sparkline.add(newPrice);

            MarketPriceResponse updated = new MarketPriceResponse(
                    symbol,
                    current.getName(),
                    newPrice,
                    changePct,
                    sparkline
            );

            savePriceToRedis(symbol, updated);
            updatedList.add(updated);
        }
        return updatedList;
    }

    public List<MarketPriceResponse> getPrices() {
        List<MarketPriceResponse> list = new ArrayList<>();
        for (String symbol : ASSET_NAMES.keySet()) {
            MarketPriceResponse price = getPriceFromRedis(symbol);
            if (price != null) {
                list.add(price);
            }
        }
        return list;
    }

    public MarketPriceResponse getPrice(String symbol) {
        String upperSymbol = symbol.toUpperCase();
        if (!ASSET_NAMES.containsKey(upperSymbol)) {
            throw new AssetNotFoundException("Asset " + symbol + " is not supported.");
        }
        MarketPriceResponse price = getPriceFromRedis(upperSymbol);
        if (price == null) {
            throw new AssetNotFoundException("Price not found for " + symbol);
        }
        return price;
    }

    public String getAssetName(String symbol) {
        return ASSET_NAMES.getOrDefault(symbol.toUpperCase(), symbol);
    }

    private MarketPriceResponse getPriceFromRedis(String symbol) {
        String key = REDIS_KEY_PREFIX + symbol;
        Object val = redisTemplate.opsForValue().get(key);
        if (val == null) {
            return null;
        }
        try {
            return objectMapper.readValue((String) val, MarketPriceResponse.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize market price for " + symbol, e);
            return null;
        }
    }

    private void savePriceToRedis(String symbol, MarketPriceResponse priceResponse) {
        String key = REDIS_KEY_PREFIX + symbol;
        try {
            String json = objectMapper.writeValueAsString(priceResponse);
            redisTemplate.opsForValue().set(key, json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize market price for " + symbol, e);
        }
    }
}
