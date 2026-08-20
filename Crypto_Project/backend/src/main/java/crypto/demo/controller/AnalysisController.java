package crypto.demo.controller;

import crypto.demo.dto.AnalysisRequest;
import crypto.demo.dto.MarketData;

// ⬇️ Jackson 라이브러리 Import 추가
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
// ⬇️ Webflux/WebClient 관련 임포트
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;

import java.time.Duration; // 타임아웃 설정용

@RestController
public class AnalysisController {

    private final WebClient webClient;
    private final String geminiApiKey;
    private final ObjectMapper objectMapper = new ObjectMapper(); // 💡 ObjectMapper 인스턴스 생성

    // 💡 Gemini REST API 엔드포인트
    private static final String GEMINI_API_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public AnalysisController(
        @Value("${GEMINI_API_KEY:NO_KEY_PROVIDED}") 
        String geminiApiKey
    ) {
        this.geminiApiKey = geminiApiKey;

        if ("NO_KEY_PROVIDED".equals(geminiApiKey)) {
            System.err.println("경고: GEMINI_API_KEY가 설정되지 않았습니다. AI 분석 기능은 Mocking 응답을 반환합니다.");
            this.webClient = null; // 키 없으면 WebClient 초기화 안 함
        } else {
            // WebClient 초기화 (API Key를 헤더에 직접 사용)
            this.webClient = WebClient.builder()
                .baseUrl(GEMINI_API_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                // API Key를 HTTP 헤더로 전달
                .defaultHeader("x-goog-api-key", geminiApiKey)
                .build();
        }
    }

    /**
     * 프런트엔드의 /api/analyze-crypto 요청을 처리하고 분석 결과를 반환합니다.
     */
    @PostMapping("/api/analyze-crypto")
    public ResponseEntity<String> analyzeCrypto(@RequestBody AnalysisRequest request) {

        String coinId = request.getCoinId();
        MarketData marketData = request.getMarketData();

        if (coinId == null || marketData == null || marketData.getMarketCap() == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"Invalid input data.\"}");
        }

        if (this.webClient == null) {
            return ResponseEntity.ok(generateMockAnalysis(coinId, marketData));
        }

        // 키가 있는 경우, 실제 API 호출을 시도합니다.
        try {
            // REST API 호출 및 결과 블로킹(동기식으로 대기)
            String analysisText = callGeminiApi(coinId, marketData);

            String escapedAnalysisText = escapeJsonString(analysisText);

            // 최종적으로 프런트엔드가 기대하는 JSON 형식으로 반환
            return ResponseEntity.ok("{\"analysis\": \"" + escapedAnalysisText + "\"}");

        } catch (Exception e) {
            System.err.println("Gemini REST API 호출 중 심각한 오류 발생: " + e.getMessage());
            e.printStackTrace();
            
            String errorMessage = "AI 분석 통신 실패: " + e.getMessage();
            String escapedError = escapeJsonString(errorMessage);
            
            // 프런트엔트가 오류를 명확히 처리할 수 있도록 error 필드에 담아 반환
            return ResponseEntity.ok("{\"error\": \"" + escapedError + "\"}");
        }
    }

    /**
     * Gemini REST API를 호출하여 분석 결과를 받아옵니다.
     */
    private String callGeminiApi(String coinId, MarketData marketData) {
        String promptText = buildPrompt(coinId, marketData);
        
        // 1. Gemini REST API 요청 JSON 본문 생성
        String jsonBody = String.format("""
            {
              "contents": [
                {
                  "parts": [
                    {
                      "text": "%s"
                    }
                  ]
                }
              ],
              "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048
              }
            }
            """, promptText.replace("\"", "\\\"").replace("\n", "\\n")); // JSON 내부 문자열 이스케이프 처리

        // 2. WebClient를 사용하여 POST 요청 실행 및 응답 대기 (블로킹)
        Mono<String> responseMono = this.webClient.post()
            .bodyValue(jsonBody)
            .retrieve()
            .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> 
                // 오류 발생 시 상세 오류 메시지 반환
                clientResponse.bodyToMono(String.class).flatMap(body -> Mono.error(
                    new RuntimeException("Gemini API Error (" + clientResponse.statusCode() + "): " + body)
                ))
            )
            .bodyToMono(String.class);

        // 3. Mono 블로킹 및 JSON 응답 문자열 확보
        String fullResponse = responseMono.block(Duration.ofSeconds(20)); // 최대 20초 대기

        // 4. 응답 JSON에서 최종 텍스트 추출 (Jackson을 사용한 안전한 파싱)
        try {
            JsonNode rootNode = objectMapper.readTree(fullResponse);
            
            // "candidates" -> 첫 번째 항목 [0] -> "content" -> "parts" -> 첫 번째 항목 [0] -> "text" 경로를 따라 순수한 텍스트를 추출
            JsonNode textNode = rootNode
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text");

            if (textNode != null && textNode.isTextual()) {
                // 이 방법은 텍스트 필드의 값만 안전하게 추출하며, 불필요한 메타데이터를 포함하지 않습니다.
                return textNode.asText(); 
            }
            
            return "AI 분석 실패: 응답 JSON에서 텍스트 필드를 찾을 수 없습니다. (원본 응답: " + fullResponse + ")";

        } catch (Exception e) {
            // JSON 파싱에 실패하면 원본 응답을 포함하여 명확한 오류를 던집니다.
            throw new RuntimeException("Gemini API 응답 파싱 실패 (Jackson): " + e.getMessage() + "\n원본 응답: " + fullResponse);
        }
    }
    
    /**
     * Gemini 모델에 전송할 프롬프트를 생성합니다.
     */
    private String buildPrompt(String coinId, MarketData marketData) {
        return String.format(
            "당신은 암호화폐 시장 전문가입니다. 다음 데이터를 바탕으로 %s 코인에 대한 심층적인 분석 및 평가를 Markdown 형식으로 작성해 주세요.\n\n" +
            "## 입력 데이터\n" +
            "- **코인 ID:** %s\n" +
            "- **시가총액:** %s\n" +
            "- **24H 거래량:** %s\n" +
            "- **24H 변동률:** %.2f%%\n\n" +
            "## 분석 요청\n" +
            "1. **종합 평가:** (강력 매수/매수/중립/매도) 중 하나를 선택하고, 5점 만점의 점수를 부여하세요.\n" +
            "2. **트렌드 분석:** 현재 시장 위치와 모멘텀을 설명하세요.\n" +
            "3. **긍정/부정 요인:** 데이터에 기반한 주요 긍정적 요인과 잠재적 부정적 요인을 나열하세요.\n" +
            "4. **결론:** 최종 투자 의견을 명확하게 제시하세요. 답변은 200자 이내로 간결하게 작성해 주세요.",
            coinId.toUpperCase(), coinId, marketData.getMarketCap(), marketData.getVolume24h(), marketData.getPriceChange24h()
        );
    }
    
    /**
     * Mocking 응답을 생성하고 JSON 문자열로 반환하는 유틸리티 메서드
     */
    private String generateMockAnalysis(String coinId, MarketData marketData) {
        String mockAnalysis = String.format(
            "# 🤖 Gemini 분석 (Mocking 응답)\\n\\n" +
            "## ⭐ %s 종합 평가: 4.2/5 (강력 매수)\\n\\n" +
            "**트렌드:** 현재 %s은 시장 리더십을 강화 중입니다.\\n" +
            "**긍정 요인:** 시가총액(%s)이 견고하며, 24H 변동률(%.2f%%)이 안정적입니다.\\n" +
            "**결론:** 키가 설정되지 않아 Mocking 응답이 반환됩니다.",
            coinId.toUpperCase(), coinId, marketData.getMarketCap(), marketData.getVolume24h(), marketData.getPriceChange24h()
        );
        
        return "{\"analysis\": \"" + escapeJsonString(mockAnalysis) + "\"}";
    }

    /**
     * JSON 문자열로 안전하게 변환하기 위한 유틸리티 메서드
     */
    private String escapeJsonString(String text) {
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n");
    }
}