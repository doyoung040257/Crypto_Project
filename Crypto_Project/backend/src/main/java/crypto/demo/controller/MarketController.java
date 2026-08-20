package crypto.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import crypto.demo.dto.TickerDTO;
import crypto.demo.Service.MarketService;
import lombok.RequiredArgsConstructor;


 

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // 프론트 React와 CORS 허용
public class MarketController {

     private final MarketService marketService;

    /**
     * 상위 20개 코인 시세 반환 (USD 기준)
     */
    @GetMapping("/top20")
    public List<TickerDTO> getTop20Coins() {
        List<Map<String, Object>> topCoins = marketService.getTopCoins(20);

        return topCoins.stream()
            .map(c -> new TickerDTO(
                c.get("id").toString(),
                c.get("symbol").toString(),
                c.get("name").toString(),

                // currentPrice
                c.get("current_price") != null
                    ? Double.parseDouble(c.get("current_price").toString())
                    : 0.0,

                // priceChangePercent24h
                c.get("price_change_percentage_24h") != null
                    ? Double.parseDouble(c.get("price_change_percentage_24h").toString())
                    : 0.0,

                // marketCap
                c.get("market_cap") != null
                    ? Double.parseDouble(c.get("market_cap").toString())
                    : 0.0,

                // totalVolume
                c.get("total_volume") != null
                    ? Double.parseDouble(c.get("total_volume").toString())
                    : 0.0
            ))
            .collect(Collectors.toList());
    }



    // 특정 코인 상세정보 반환

    @GetMapping("/detail")
    public Map<String, Object> getCoinDetail(String coinId) {
        return marketService.getCoinDetail(coinId);
    }


    // 특정 코인 차트 데이터 반환
     
    @GetMapping("/chart")
    public Map<String, Object> getCoinChart(String coinId, int days) {
        return marketService.getCoinChart(coinId, days);

    }
}
