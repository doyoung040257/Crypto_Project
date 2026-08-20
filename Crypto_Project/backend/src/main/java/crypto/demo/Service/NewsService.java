package crypto.demo.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import crypto.demo.dto.NewsListDTO;

@Service
public class NewsService {

    private final WebClient webClient;
    private final GeminiService geminiService;

    @Value("${coindesk.api.key}")
    private String apiKey;

    // [중요] 일일 요청 수가 20회뿐이므로 static 캐시가 필수입니다.
    private static List<NewsListDTO> cachedNewsList = null;
    private static LocalDateTime lastFetchTime = null;

    public NewsService(WebClient.Builder webClientBuilder, GeminiService geminiService) {
        this.webClient = webClientBuilder.build();
        this.geminiService = geminiService;
    }

    public List<NewsListDTO> getNewsList() {
        // 캐시 기간을 30분으로 늘려 일일 할당량(20회)을 보존합니다.
        if (cachedNewsList != null && lastFetchTime != null && 
            lastFetchTime.plusMinutes(30).isAfter(LocalDateTime.now())) {
            System.out.println("⚡ [일일 할당량 보존] 캐시된 데이터를 사용합니다.");
            return cachedNewsList;
        }

        try {
            // 뉴스 5개 요청
            Map<String, Object> response = webClient.get()
                .uri("https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=50&api_key=" + apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("Data");

            StringBuilder sb = new StringBuilder();
            sb.append("Translate titles to Korean. Split with '###':\n");
            for (Map<String, Object> item : data) {
                sb.append(item.get("TITLE")).append("\n###\n");
            }

            String translatedFull = geminiService.translate(sb.toString());
            String[] titles = (translatedFull != null) ? translatedFull.split("###") : new String[0];

            List<NewsListDTO> newList = new ArrayList<>();
            for (int i = 0; i < data.size(); i++) {
                Map<String, Object> item = data.get(i);
                NewsListDTO dto = new NewsListDTO();
                dto.setImageUrl((String) item.get("IMAGE_URL"));
                dto.setUrl((String) item.get("URL"));
                dto.setBody((String) item.get("BODY"));

                if (i < titles.length && !titles[i].trim().isEmpty()) {
                    dto.setTitle(titles[i].trim());
                } else {
                    dto.setTitle((String) item.get("TITLE"));
                }
                newList.add(dto);
            }

            cachedNewsList = newList;
            lastFetchTime = LocalDateTime.now();
            return newList;

        } catch (Exception e) {
            return (cachedNewsList != null) ? cachedNewsList : new ArrayList<>();
        }
    }
}