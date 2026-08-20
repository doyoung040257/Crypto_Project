package crypto.demo.Service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import crypto.demo.dto.ExchangeRateDTO;

@Service
public class ExchangeService {

    @Value("${exchange.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public double getUsdToKrw() {
        try {
            // 오늘 날짜 (YYYYMMDD)
            String today = java.time.LocalDate.now().toString().replaceAll("-", "");

            String url = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON"
                       + "?authkey=" + apiKey
                       + "&searchdate=" + today
                       + "&data=AP01";

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response != null) {
                for (Map<String, Object> item : response) {
                    if ("USD".equals(item.get("cur_unit"))) {
                        String rateStr = (String) item.get("deal_bas_r");
                        return Double.parseDouble(rateStr.replace(",", ""));
                    }
                }
            }

            return 0;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    public ExchangeRateDTO getUsdToKrwDTO() { // ✅ 이름 변경으로 충돌 방지
        try {
            // 오늘 날짜 (YYYYMMDD)
            String today = java.time.LocalDate.now().toString().replaceAll("-", "");

            String url = "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON"
                       + "?authkey=" + apiKey
                       + "&searchdate=" + today
                       + "&data=AP01"; 

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response != null) {
                // USD 환율 찾기
                for (Map<String, Object> item : response) {
                    if ("USD".equals(item.get("cur_unit"))) {
                        String rateStr = (String) item.get("deal_bas_r");
                        double krw = Double.parseDouble(rateStr.replace(",", ""));
                        return new ExchangeRateDTO(krw);
                    }
                }
            }
            return new ExchangeRateDTO(0);
        } catch (Exception e) {
            e.printStackTrace();
            return new ExchangeRateDTO(0);
        }
    }
}
