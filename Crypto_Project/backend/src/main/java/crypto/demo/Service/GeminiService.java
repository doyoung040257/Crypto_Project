package crypto.demo.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String translate(String text) {
        if (text == null || geminiApiKey == null) return null;

        // [사진 기반 업데이트] 모델명을 사진과 정확히 일치시킵니다.
        String model = "gemini-2.5-flash"; 
        // URL 구조를 v1beta로 고정합니다.
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + geminiApiKey;

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", text))))
        );

        try {
            // [방어막] 사진상 RPM이 5이므로, 요청 간격을 넉넉히 3초 둡니다.
            Thread.sleep(3000);

            Map<String, Object> response = webClient.post()
                .uri(url)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            }
        } catch (Exception e) {
            System.err.println("Gemini 2.5 호출 에러: " + e.getMessage());
        }
        return null; 
    }
}