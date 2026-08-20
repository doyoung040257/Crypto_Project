package crypto.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//상위 코인 시세 정보를 담는 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TickerDTO {

    private String id;              // 코인 ID (coingecko 기준)
    private String symbol;          // 심볼 (BTC, ETH 등)
    private String name;            // 코인 이름 (Bitcoin, Ethereum 등)
    private double currentPrice;    // 현재가 (USD 기준)
    private double priceChangePercent24h; // 24시간 변동률 %
    private double marketCap;       // 시가총액
    private double totalVolume;     // 거래량

    
}
