package crypto.demo.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class MarketService {

    private final WebClient webClient;
    private final ExchangeService exchangeService;

    @Value("${coingecko.api.key}")
    private String apiKey;

    // ===============================
    // 캐시 저장소
    // ===============================
    private List<Map<String, Object>> cachedTopCoins = new ArrayList<>();
    private final Map<String, Map<String, Object>> cachedCoinDetails = new ConcurrentHashMap<>();

    // 🔥 가격 단일 진실 소스
    private final Map<String, Double> cachedCurrentPricesUSD = new ConcurrentHashMap<>();
    private final Map<String, Double> cachedCurrentPricesKRW = new ConcurrentHashMap<>();

    public MarketService(WebClient.Builder webClientBuilder, ExchangeService exchangeService) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.coingecko.com/api/v3")
                .build();
        this.exchangeService = exchangeService;
    }

    // ===============================
    // 상위 코인 리스트 + 가격 캐싱 (5분마다)
    // ===============================
    @Scheduled(fixedRate = 300000)
    public void updateTopCoinsCache() {

        // 1️⃣ 상위 코인 메타데이터
        try {
            List<Map<String, Object>> data = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/coins/markets")
                            .queryParam("vs_currency", "usd")
                            .queryParam("order", "market_cap_desc")
                            .queryParam("per_page", 20)
                            .queryParam("page", 1)
                            .queryParam("sparkline", false)
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();

            if (data != null) {
                this.cachedTopCoins = data;
                System.out.println("✅ 상위 코인 메타데이터 갱신 (" + data.size() + "개)");
            }
        } catch (Exception e) {
            System.err.println("❌ 상위 코인 메타데이터 실패: " + e.getMessage());
            return;
        }

        // 2️⃣ id ↔ symbol 매핑
        Map<String, String> idToSymbol = cachedTopCoins.stream()
                .collect(Collectors.toMap(
                        c -> (String) c.get("id"),
                        c -> (String) c.get("symbol")
                ));

        // 3️⃣ 실시간 가격 (단일 기준)
        try {
            String ids = String.join(",", idToSymbol.keySet());

            Map<String, Map<String, Object>> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/simple/price")
                            .queryParam("ids", ids)
                            .queryParam("vs_currencies", "usd")
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Map<String, Object>>>() {})
                    .block();

            if (response == null) return;

            double usdToKrw = exchangeService.getUsdToKrw();

            // 4️⃣ USD / KRW 가격 캐시
            response.forEach((id, priceMap) -> {
                Object usdObj = priceMap.get("usd");
                if (usdObj instanceof Number) {
                    double usdPrice = ((Number) usdObj).doubleValue();
                    double krwPrice = Math.round(usdPrice * usdToKrw);

                    String symbol = idToSymbol.get(id);
                    if (symbol != null) {
                        cachedCurrentPricesUSD.put(symbol, usdPrice);
                        cachedCurrentPricesKRW.put(symbol, krwPrice);

                        System.out.println(
                            "💰 가격 통일: " + symbol +
                            " | USD = " + usdPrice +
                            " | KRW = " + (long) krwPrice
                        );
                    }
                }
            });

            // 5️⃣ coins/markets의 current_price 덮어쓰기 ⭐
            for (Map<String, Object> coin : cachedTopCoins) {
                String symbol = (String) coin.get("symbol");
                if (symbol != null && cachedCurrentPricesUSD.containsKey(symbol)) {
                    coin.put("current_price", cachedCurrentPricesUSD.get(symbol));
                }
            }

        } catch (Exception e) {
            System.err.println("⚠ 가격 갱신 실패: " + e.getMessage());
        }
    }

    // ===============================
    // 상위 코인 리스트
    // ===============================
    public List<Map<String, Object>> getTopCoins(int perPage) {
        return cachedTopCoins;
    }

    // ===============================
    // 코인 상세 정보
    // ===============================
    public Map<String, Object> getCoinDetail(String coinId) {
        if (cachedCoinDetails.containsKey(coinId)) {
            return cachedCoinDetails.get(coinId);
        }

        try {
            Map<String, Object> detail = webClient.get()
                    .uri("/coins/" + coinId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (detail != null) {
                cachedCoinDetails.put(coinId, detail);
            }
            return detail;

        } catch (Exception e) {
            System.err.println("❌ 코인 상세 조회 실패: " + e.getMessage());
            return null;
        }
    }

    // ===============================
    // 차트 데이터
    // ===============================
    public Map<String, Object> getCoinChart(String coinId, int days) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/coins/" + coinId + "/market_chart")
                            .queryParam("vs_currency", "usd")
                            .queryParam("days", days)
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (Exception e) {
            System.err.println("❌ 차트 조회 실패: " + e.getMessage());
            return null;
        }
    }

    // ===============================
    // KRW 가격 조회
    // ===============================
    public double getCurrentPriceKRW(String symbol) {
        return cachedCurrentPricesKRW.getOrDefault(symbol, 0.0);
    }
}
