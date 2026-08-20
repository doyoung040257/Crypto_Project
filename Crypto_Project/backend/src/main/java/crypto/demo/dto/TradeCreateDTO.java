package crypto.demo.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TradeCreateDTO {

    private Long userId;          // FK
    private String cryptoName;
    private String cryptoSymbol;
    private String orderType;     // BUY / SELL
    private BigDecimal tradePrice;
    private BigDecimal tradeQuantity;
}
