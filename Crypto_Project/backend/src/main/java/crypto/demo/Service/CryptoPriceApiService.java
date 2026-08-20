// src/main/java/crypto/demo/Service/CryptoPriceApiService.java
package crypto.demo.Service;
// 선호님 저 현준입니다. 12월 24일에 제가 추가한 코드입니다. 헷갈리지 마세요
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient; // Mono 사용을 위해 추가
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors; // Collectors 임포트 추가

@Service
@Slf4j // Lombok을 이용한 로거 생성
public class CryptoPriceApiService {

    private final WebClient webClient; // WebClient 객체 선언

    // Lombok의 @RequiredArgsConstructor 대신 생성자를 직접 작성하여 WebClient.Builder 주입 및 build() 호출
    public CryptoPriceApiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.binance.com/api/v3").build(); // Binance 기본 URL 설정
    }

    // 심볼별 최신 가격을 캐싱하기 위한 맵 (성능 최적화)
    private final Map<String, BigDecimal> priceCache = new ConcurrentHashMap<>();
    private final long CACHE_EXPIRATION_TIME_MS = 1000 * 60; // 1분 (60초) 캐시 유효 시간
    private volatile long lastCacheUpdateTime = 0;

    // Binance API (실시간 시세 조회)
    // private static final String BINANCE_TICKER_PRICE_URL = "https://api.binance.com/api/v3/ticker/price"; // baseUrl로 옮김

    /**
     * 단일 암호화폐의 실시간 가격을 가져옵니다. (USD 기준이라고 가정, 또는 특정 화폐 기준)
     * @param symbol 암호화폐 심볼 (예: BTCUSDT, ETHUSDT)
     * @return BigDecimal 형태의 가격
     */
    public Mono<BigDecimal> getCryptoPrice(String symbol) {
        // 캐시가 만료되지 않았고, 해당 심볼의 가격이 캐시에 있다면 캐시된 가격 반환
        if (System.currentTimeMillis() - lastCacheUpdateTime < CACHE_EXPIRATION_TIME_MS && priceCache.containsKey(symbol)) {
            log.info("캐시된 가격 반환: {} = {}", symbol, priceCache.get(symbol));
            return Mono.just(priceCache.get(symbol));
        }

        log.info("Binance API 호출: {}", symbol);
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/ticker/price") // 기본 URL에 /ticker/price 경로 추가
                                              .queryParam("symbol", symbol)
                                              .build())
                .retrieve()
                .bodyToMono(Map.class) // 응답을 Map 형태로 받음
                .map(response -> {
                    String priceStr = (String) response.get("price");
                    BigDecimal price = new BigDecimal(priceStr);
                    priceCache.put(symbol, price); // 캐시에 저장
                    lastCacheUpdateTime = System.currentTimeMillis(); // 캐시 업데이트 시간 기록
                    return price;
                })
                 .doOnError(e -> log.error("암호화폐 가격을 가져오는 데 실패: {}", symbol, e)) // 💡 e만 전달하여 스택 트레이스 출력
                .onErrorResume(e -> {
                    log.error("Error fetching crypto price for {}: {}", symbol, e.getMessage());
                    return Mono.just(BigDecimal.ZERO); // 에러 발생 시 0 반환 또는 다른 예외 처리
                });
    }
    
    /**
     * 여러 암호화폐의 실시간 가격을 가져와 Map으로 반환합니다.
     * @param symbols 조회할 암호화폐 심볼 리스트 (예: ["BTCUSDT", "ETHUSDT"])
     * @return 심볼:가격 형태의 Map<String, BigDecimal>
     */
    public Mono<Map<String, BigDecimal>> getCryptoPrices(List<String> symbols) {
        if (symbols == null || symbols.isEmpty()) {
            return Mono.just(new ConcurrentHashMap<>());
        }

        // 캐시가 유효하면 캐시된 가격만 반환
        // 모든 심볼이 캐시에 있는지 확인
        boolean allSymbolsInCache = true;
        Map<String, BigDecimal> cachedPrices = new ConcurrentHashMap<>();
        if (System.currentTimeMillis() - lastCacheUpdateTime < CACHE_EXPIRATION_TIME_MS) {
            for (String symbol : symbols) {
                if (priceCache.containsKey(symbol)) {
                    cachedPrices.put(symbol, priceCache.get(symbol));
                } else {
                    allSymbolsInCache = false; // 하나라도 캐시에 없으면 다시 API 호출
                    break;
                }
            }
        } else {
            allSymbolsInCache = false; // 캐시 만료
        }
        
        if (allSymbolsInCache) {
            log.info("모든 심볼에 대해 캐시된 가격 반환: {}", cachedPrices.keySet());
            return Mono.just(cachedPrices);
        }

        // 캐시되지 않았거나 캐시가 만료되었다면 API 호출
        // 각 심볼별로 getCryptoPrice 호출하고 결과를 Map으로 조합
        return Mono.zip(
                symbols.stream()
                        .map(this::getCryptoPrice) // 각 심볼별로 개별 가격을 가져옴
                        .collect(Collectors.toList()),
                results -> { // 모든 getCryptoPrice 결과가 모이면 실행
                    Map<String, BigDecimal> combinedPrices = new ConcurrentHashMap<>();
                    for (int i = 0; i < symbols.size(); i++) {
                        String symbol = symbols.get(i);
                        BigDecimal price = (BigDecimal) results[i];
                        combinedPrices.put(symbol, price);
                        priceCache.put(symbol, price); // 개별 호출 결과 캐시 업데이트
                    }
                    lastCacheUpdateTime = System.currentTimeMillis(); // 캐시 전체 업데이트 시간 기록
                    log.info("API 호출 후 통합된 가격: {}", combinedPrices);
                    return combinedPrices;
                }
        );
    }
}