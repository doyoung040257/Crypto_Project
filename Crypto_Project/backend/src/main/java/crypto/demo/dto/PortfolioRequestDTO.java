package crypto.demo.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRequestDTO {
    private Long userId;              // 사용자 ID
    private String cryptoName;        // 코인 이름
    private String cryptoSymbol;      // 코인 심볼
    private String orderType;         // 매도/매수 ("BUY" or "SELL")
    private BigDecimal tradePrice;    // 거래 가격
    private BigDecimal tradeQuantity; // 거래 수량

}
