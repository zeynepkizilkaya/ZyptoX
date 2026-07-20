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
import org.springframework.web.client.RestClient;

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
        ASSET_NAMES.put("SHIB", "Shiba Inu");
        ASSET_NAMES.put("TON", "Toncoin");
        ASSET_NAMES.put("NEAR", "NEAR Protocol");
        ASSET_NAMES.put("PEPE", "Pepe");
        ASSET_NAMES.put("WIF", "dogwifhat");
        ASSET_NAMES.put("RENDER", "Render");
        ASSET_NAMES.put("SUI", "Sui");
        ASSET_NAMES.put("APT", "Aptos");
        ASSET_NAMES.put("TIA", "Celestia");

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
        INITIAL_PRICES.put("SHIB", BigDecimal.valueOf(0.000018));
        INITIAL_PRICES.put("TON", BigDecimal.valueOf(7.20));
        INITIAL_PRICES.put("NEAR", BigDecimal.valueOf(5.50));
        INITIAL_PRICES.put("PEPE", BigDecimal.valueOf(0.000008));
        INITIAL_PRICES.put("WIF", BigDecimal.valueOf(2.50));
        INITIAL_PRICES.put("RENDER", BigDecimal.valueOf(7.80));
        INITIAL_PRICES.put("SUI", BigDecimal.valueOf(1.20));
        INITIAL_PRICES.put("APT", BigDecimal.valueOf(6.80));
        INITIAL_PRICES.put("TIA", BigDecimal.valueOf(5.20));
    }

    private RestClient restClient = RestClient.builder().build();

    @PostConstruct
    public void init() {
        log.info("Initializing market prices...");
        try {
            updatePricesFromBinance();
        } catch (Exception e) {
            log.warn("Failed to initialize prices from Binance. Falling back to local mock prices.", e);
            initializeMockPrices();
        }
    }

    private void initializeMockPrices() {
        for (String symbol : ASSET_NAMES.keySet()) {
            String key = REDIS_KEY_PREFIX + symbol;
            if (Boolean.FALSE.equals(redisTemplate.hasKey(key))) {
                BigDecimal initialPrice = INITIAL_PRICES.get(symbol);
                List<BigDecimal> sparkline = new ArrayList<>();
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
        log.info("Running scheduled market price update from Binance");
        updatePricesFromBinance();
    }

    public void updatePricesFromBinance() {
        try {
            String symbolsParam = "[\"BTCUSDT\",\"ETHUSDT\",\"SOLUSDT\",\"BNBUSDT\",\"XRPUSDT\",\"ADAUSDT\",\"DOTUSDT\",\"DOGEUSDT\",\"AVAXUSDT\",\"LINKUSDT\",\"SHIBUSDT\",\"TONUSDT\",\"NEARUSDT\",\"PEPEUSDT\",\"WIFUSDT\",\"RENDERUSDT\",\"SUIUSDT\",\"APTUSDT\",\"TIAUSDT\"]";
            String url = "https://api.binance.com/api/v3/ticker/24hr?symbols=" + symbolsParam;
            
            List<Map<String, Object>> response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<List<Map<String, Object>>>() {});
                    
            if (response != null) {
                for (Map<String, Object> ticker : response) {
                    String binanceSymbol = (String) ticker.get("symbol");
                    String appSymbol = binanceSymbol.replace("USDT", "");
                    
                    BigDecimal price = new BigDecimal((String) ticker.get("lastPrice"));
                    BigDecimal changePct = new BigDecimal((String) ticker.get("priceChangePercent"));
                    
                    // Adjust scale based on price size
                    if (price.compareTo(BigDecimal.valueOf(0.001)) < 0) {
                        price = price.setScale(8, RoundingMode.HALF_UP);
                    } else if (price.compareTo(BigDecimal.ONE) < 0) {
                        price = price.setScale(6, RoundingMode.HALF_UP);
                    } else {
                        price = price.setScale(2, RoundingMode.HALF_UP);
                    }

                    MarketPriceResponse current = getPriceFromRedis(appSymbol);
                    List<BigDecimal> sparkline = new ArrayList<>();
                    if (current != null && current.getSparkline() != null) {
                        sparkline = new ArrayList<>(current.getSparkline());
                        if (sparkline.size() >= 7) {
                            sparkline.remove(0);
                        }
                        sparkline.add(price);
                    } else {
                        for (int i = 0; i < 6; i++) {
                            sparkline.add(price);
                        }
                        sparkline.add(price);
                    }
                    
                    MarketPriceResponse updated = new MarketPriceResponse(
                            appSymbol,
                            ASSET_NAMES.get(appSymbol),
                            price,
                            changePct,
                            sparkline
                    );
                    
                    savePriceToRedis(appSymbol, updated);
                    
                    priceHistoryRepository.save(PriceHistory.builder()
                            .assetSymbol(appSymbol)
                            .price(price)
                            .recordedAt(Instant.now())
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch live prices from Binance, falling back to mock fluctuation", e);
            fluctuatePrices();
            
            // Save mock price snapshots to database
            for (String symbol : ASSET_NAMES.keySet()) {
                MarketPriceResponse price = getPriceFromRedis(symbol);
                if (price != null) {
                    priceHistoryRepository.save(PriceHistory.builder()
                            .assetSymbol(symbol)
                            .price(price.getPrice())
                            .recordedAt(Instant.now())
                            .build());
                }
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
            if (newPrice.compareTo(BigDecimal.valueOf(0.001)) < 0) {
                newPrice = newPrice.setScale(8, RoundingMode.HALF_UP);
            } else if (newPrice.compareTo(BigDecimal.ONE) < 0) {
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

    public List<List<Object>> getKlines(String symbol, String interval, Integer limit) {
        try {
            String url = String.format("https://api.binance.com/api/v3/klines?symbol=%sUSDT&interval=%s&limit=%d", 
                    symbol.toUpperCase(), interval, limit);
            return restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<List<List<Object>>>() {});
        } catch (Exception e) {
            log.error("Failed to fetch klines from Binance for " + symbol, e);
            return generateMockKlines(symbol, interval, limit);
        }
    }

    private List<List<Object>> generateMockKlines(String symbol, String interval, Integer limit) {
        List<List<Object>> list = new ArrayList<>();
        long now = Instant.now().toEpochMilli();
        long intervalMs = 3600000; // 1h
        if ("5m".equals(interval)) intervalMs = 300000;
        else if ("15m".equals(interval)) intervalMs = 900000;
        else if ("4h".equals(interval)) intervalMs = 14400000;

        double basePrice = 60000.0;
        MarketPriceResponse cached = getPriceFromRedis(symbol.toUpperCase());
        if (cached != null) {
            basePrice = cached.getPrice().doubleValue();
        }

        Random random = new Random();

        for (int i = 0; i < limit; i++) {
            long time = now - (limit - 1 - i) * intervalMs;
            double pct = Math.sin(i * 0.5) * 0.02 + random.nextDouble() * 0.01;
            double price = basePrice * (1 + pct);
            
            List<Object> kline = new ArrayList<>();
            kline.add(time); // Open time
            kline.add(String.valueOf(price * 0.99)); // Open
            kline.add(String.valueOf(price * 1.01)); // High
            kline.add(String.valueOf(price * 0.99)); // Low
            kline.add(String.valueOf(price)); // Close
            kline.add("100.0"); // Volume
            kline.add(time + intervalMs - 1); // Close time
            kline.add("6000000.0");
            kline.add(100);
            kline.add("50.0");
            kline.add("3000000.0");
            kline.add("0");
            
            list.add(kline);
        }
        return list;
    }
}
