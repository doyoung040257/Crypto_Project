package crypto.demo.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeDTO {

    private Long simulId;
    private Long userId;
    private String loginId;

    private String cryptoName;
    private String cryptoSymbol;
    private String orderType;

    private BigDecimal tradePrice;
    private BigDecimal tradeQuantity;
    private BigDecimal totalPrice;

    private LocalDateTime tradeTime;
}
