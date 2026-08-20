// backend/src/main/java/crypto/demo/controller/CoinController.java

package crypto.demo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference; // 💡 FIX: 이 import를 추가합니다.
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import java.util.List;

@RestController
@RequestMapping("/api/coins")
public class CoinController {

    private final WebClient webClient;

    public CoinController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.coingecko.com/api/v3").build();
    }

    // =================================================================================
    // 1. 코인 목록 API: GET /api/coins/list
    // =================================================================================
    @Cacheable(value = "coins", key = "'list'") // 💡 캐시 적용 (키: 'list')
    @GetMapping("/list")
    public Mono<List<JsonNode>> getCoinList() {
        return webClient.get()
                .uri("/coins/list")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleApiError)
                // 💡 수정된 부분: Spring의 ParameterizedTypeReference 사용
                .bodyToMono(new ParameterizedTypeReference<List<JsonNode>>() {})
                .onErrorResume(ResponseStatusException.class, e -> {
                    // CoinGecko 리스트는 캐시 만료 시에만 호출되므로 오류가 발생하면 빈 리스트 반환
                    return Mono.just(List.of()); 
                });
    }

    // =================================================================================
    // 2. 마켓 데이터 API: GET /api/coins/markets
    // =================================================================================
    @Cacheable(value = "coins", key = "'markets'") // 💡 캐시 적용 (키: 'markets')
    @GetMapping("/markets")
    public Mono<List<JsonNode>> getCoinMarkets(
            @RequestParam(defaultValue = "usd") String vs_currency,
            @RequestParam(defaultValue = "market_cap_desc") String order,
            @RequestParam(defaultValue = "20") int per_page,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "true") String sparkline,
            @RequestParam(defaultValue = "24h") String price_change_percentage) {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/coins/markets")
                        .queryParam("vs_currency", vs_currency)
                        .queryParam("order", order)
                        .queryParam("per_page", per_page)
                        .queryParam("page", page)
                        .queryParam("sparkline", sparkline)
                        .queryParam("price_change_percentage", price_change_percentage)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleApiError)
                // 💡 마켓 데이터도 제네릭 타입이므로 ParameterizedTypeReference 사용
                .bodyToMono(new ParameterizedTypeReference<List<JsonNode>>() {}); 
    }

    // =================================================================================
    // 3. 코인 상세 정보 API: GET /api/coins/details/{coinId}
    // =================================================================================
    @Cacheable(value = "coins", key = "#coinId") // 💡 캐시 적용 (키: 코인 ID)
    @GetMapping("/details/{coinId}")
    public Mono<JsonNode> getCoinDetails(@PathVariable String coinId) {
        return webClient.get()
                .uri("/coins/{id}", coinId)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleApiError)
                .bodyToMono(JsonNode.class); // 단일 객체이므로 Class<T> 사용
    }

    // =================================================================================
    // 4. 차트 데이터 API: GET /api/coins/chart/{coinId}
    // =================================================================================
    @Cacheable(value = "coins", key = "#coinId + '-' + #days") // 💡 캐시 적용 (키: 코인 ID와 일수 조합)
    @GetMapping("/chart/{coinId}")
    public Mono<JsonNode> getMarketChart(
            @PathVariable String coinId,
            @RequestParam(defaultValue = "usd") String vs_currency,
            @RequestParam(defaultValue = "7") String days) {

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/coins/{id}/market_chart")
                        .queryParam("vs_currency", vs_currency)
                        .queryParam("days", days)
                        .build(coinId))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleApiError)
                .bodyToMono(JsonNode.class); // 단일 객체이므로 Class<T> 사용
    }
    
    // 5. 공통 오류 처리 유틸리티 (이전 코드와 동일)
    private Mono<? extends Throwable> handleApiError(
            org.springframework.web.reactive.function.client.ClientResponse response) {
        
        if (response.statusCode().equals(HttpStatus.TOO_MANY_REQUESTS)) {
            return Mono.error(new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                    "CoinGecko Rate Limit 도달: 잠시 후 다시 시도하세요."));
        }
        if (response.statusCode().equals(HttpStatus.NOT_FOUND)) {
            return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "요청하신 코인 ID를 찾을 수 없습니다."));
        }
        
        return Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, 
                "외부 API 호출 중 알 수 없는 오류 발생: " + response.statusCode()));
    }
}